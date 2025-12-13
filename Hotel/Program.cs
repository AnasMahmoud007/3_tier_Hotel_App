using Hotel.Model;
using Microsoft.AspNetCore.Authentication.Cookies; // Added for CookieAuthenticationDefaults
using Microsoft.AspNetCore.Http; // Added to resolve HandleResponse

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
// builder.Services.AddRazorPages();
builder.Services.AddTransient<dbclass>();

// Add Controllers service
builder.Services.AddControllers();

// Add CORS services
builder.Services.AddCors(options =>
{
    options.AddPolicy(name: "AllowSpecificOrigin",
                      builder =>
                      {
                          builder.WithOrigins("http://localhost:5000") // Frontend Nginx origin
                                 .AllowAnyHeader()
                                 .AllowAnyMethod();
                      });
});

// Add Authentication Services
builder.Services.AddAuthentication(CookieAuthenticationDefaults.AuthenticationScheme)
    .AddCookie(options =>
    {
        options.LoginPath = "/Login SingUp"; // Specify your login page path
        options.LogoutPath = "/Logout"; // Optional: Specify a logout path
        options.Events = new CookieAuthenticationEvents
        {
            OnRedirectToLogin = context =>
            {
                if (context.Request.Path.StartsWithSegments("/api"))
                {
                    context.Response.StatusCode = StatusCodes.Status401Unauthorized;
                    return context.Response.CompleteAsync();
                }
                return Task.CompletedTask;
            }
        };
    });

builder.Services.AddAuthorization(); // Added for backend.


var app = builder.Build();

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Error");
    // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
    app.UseHsts();
}

// app.UseHttpsRedirection(); // Commented out for Docker development environment
// app.UseStaticFiles();

app.UseRouting();

app.UseCors("AllowSpecificOrigin");

// Use Authentication middleware BEFORE Authorization
app.UseAuthentication(); // Added Authentication middleware
app.UseAuthorization();

app.MapControllers(); // Moved before generic MapGet
// app.MapRazorPages();
app.MapGet("/", () => "Hello from Backend API!");

app.Run();
