-- Drop database if it exists (optional, for clean runs)
IF DB_ID('Hotel') IS NOT NULL
BEGIN
    ALTER DATABASE Hotel SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
    DROP DATABASE Hotel;
END;
GO

-- Create the Hotel database
CREATE DATABASE Hotel;
GO

-- Switch to the Hotel database
USE Hotel;
GO

-- Content of Updated create tables For Hotel.sql
CREATE TABLE Guest (
    UserName VARCHAR(50) PRIMARY KEY, 
    Password VARCHAR(50),
    Name VARCHAR(50),
    UserInformation VARCHAR(MAX)
);

CREATE TABLE RoomType (
    RoomTypeID INT,
    CategoryName VARCHAR(50) PRIMARY KEY,
	Price INT,
    Description VARCHAR(MAX),
    bed INT,        -- Added bed column
    bath INT,       -- Added bath column
    photo VARCHAR(MAX) -- Added photo column
);

CREATE TABLE Room (
    RoomNumber INT PRIMARY KEY,
	CategoryName VARCHAR(50),
    PricePerNight DECIMAL(10, 2),
    /*PRIMARY KEY (RoomTypeID, RoomNumber),*/
    FOREIGN KEY (CategoryName) REFERENCES RoomType(CategoryName)
);

CREATE TABLE Manager (
    UserName VARCHAR(50) PRIMARY KEY,
    Password VARCHAR(50),
	ManagerName VARCHAR(50),
    ModifyInformation INT,
    InformationAboutStaff INT,
    InformationAboutHotel INT
);

CREATE TABLE Admin (
    UserName VARCHAR(50) PRIMARY KEY,
    Password VARCHAR(50),
    SystemAdministration INT,
    CreateOtherAdminUser INT,
    CreateStaff INT,
	aimg image,
);

CREATE TABLE RoomManager (
    CategoryName VARCHAR(50),
    ManagerUserName VARCHAR(50),
    FOREIGN KEY (CategoryName) REFERENCES RoomType(CategoryName),
    FOREIGN KEY (ManagerUserName) REFERENCES Manager(UserName)
);

CREATE TABLE Reservation (
    ReservationID INT PRIMARY KEY IDENTITY(1,1),
    RoomNumber INT,
    UserName VARCHAR(50),
    CheckInDate DATE,
    CheckOutDate DATE,
    FOREIGN KEY (RoomNumber) REFERENCES Room(RoomNumber),
    FOREIGN KEY (UserName) REFERENCES Guest(UserName)
);

/*CREATE TABLE Receptionist (
    UserName VARCHAR(50) PRIMARY KEY,
    Password VARCHAR(50)
);*/

CREATE TABLE Payment (
    PaymentID INT PRIMARY KEY,
	PaymentKinde VARCHAR(50),
	GUserName VARCHAR(50),
    ReservationID INT,
    Amount DECIMAL(10, 2),
    TransactionDate DATE,
	FOREIGN KEY (GUserName) REFERENCES Guest(UserName),
    FOREIGN KEY (ReservationID) REFERENCES Reservation(ReservationID)
);

CREATE TABLE Billing (
    PaymentID INT,
    ReservationID INT,
    InvoiceDetails VARCHAR(MAX),
    PaymentStatus VARCHAR(50),
    DueDate DATE,
    GuestName VARCHAR(50),
    FOREIGN KEY (PaymentID) REFERENCES Payment(PaymentID),
    FOREIGN KEY (ReservationID) REFERENCES Reservation(ReservationID)
);

CREATE TABLE Feedback (
    FeedbackID INT PRIMARY KEY IDENTITY(1,1),
    UserName VARCHAR(50),
    FeedbackDate DATE,
    Comments VARCHAR(MAX),
    Rating INT,
    FOREIGN KEY (UserName) REFERENCES Guest(UserName)
);

CREATE TABLE Event (
    EventID INT PRIMARY KEY,
    EventName VARCHAR(50),
    EventDate DATE,
    Attendees INT,
    CateringDetails VARCHAR(MAX),
    RoomBookingID INT,
    FOREIGN KEY (RoomBookingID) REFERENCES Reservation(ReservationID)
);



CREATE TABLE Services (
    ServiceID INT PRIMARY KEY,
    AmenityName VARCHAR(50),
    Description VARCHAR(MAX),
    Availability INT,
    AdditionalCharges DECIMAL(10, 2),
    icon VARCHAR(50) -- Added icon column
);
GO


-- Sample data for Services
INSERT INTO Services (ServiceID, AmenityName, Description, Availability, AdditionalCharges, icon) VALUES
(1, 'WiFi', 'High-speed internet access', 1, 0.00, 'wifi'),
(2, 'Pool Access', 'Access to the hotel swimming pool', 1, 0.00, 'swimming-pool'),
(3, 'Breakfast Buffet', 'Daily breakfast buffet', 1, 15.00, 'utensils'),
(4, 'Spa & Wellness', 'Spa treatments and wellness facilities', 1, 50.00, 'spa');
GO

CREATE TABLE StafRoles (
    SRoleName VARCHAR(50) PRIMARY KEY
);

CREATE TABLE Staff (
    StaffEmployeeID INT PRIMARY KEY,
	Accessibility INT,
    SUsername VARCHAR(50),
    Password VARCHAR(50),
    Name VARCHAR(50),
    Role VARCHAR(50),
	ManagerUserName VARCHAR(50),
    AdminUserName VARCHAR(50),
    FOREIGN KEY (ManagerUserName) REFERENCES Manager(UserName),
	FOREIGN KEY (Role) REFERENCES StafRoles(SRoleName),
    FOREIGN KEY (AdminUserName) REFERENCES Admin(UserName)
);

CREATE TABLE Offers(
	OffersName VARCHAR(50),
	days INT,
	Person INT,
	Price DECIMAL(10, 2),
	Description VARCHAR(MAX)
);
GO


-- Content of seed_data.sql
-- Sample data for RoomType
INSERT INTO RoomType (RoomTypeID, CategoryName, Price, Description, bed, bath, photo) VALUES
(1, 'Standard', 100, 'A comfortable standard room.', 1, 1, 'img_1.jpg'),
(2, 'Deluxe', 150, 'A spacious deluxe room with extra amenities.', 2, 1, 'img_2.jpg'),
(3, 'Suite', 250, 'A luxurious suite with a separate living area.', 2, 2, 'img_3.jpg');
GO

-- Sample data for Guest (required for Feedback foreign key)
INSERT INTO Guest (UserName, Password, Name, UserInformation) VALUES
('testuser', 'password123', 'Test User', 'Regular guest');
GO

-- Sample data for Feedback
INSERT INTO Feedback (UserName, FeedbackDate, Comments, Rating) VALUES
('testuser', '2025-12-07', 'Great stay, excellent service!', 5),
('testuser', '2025-12-06', 'Good experience overall.', 4);
GO

-- Insert admin user into Guest table
INSERT INTO Guest (UserName, Password, Name, UserInformation) VALUES ('admin', 'admin123', 'Admin User', 'admin@test.com');
GO

-- Insert sample Admin user into Admin table (for loginHE page)
INSERT INTO Admin (UserName, Password, SystemAdministration, CreateOtherAdminUser, CreateStaff, aimg) VALUES ('admin', 'Admin!123', 1, 1, 1, NULL);
GO