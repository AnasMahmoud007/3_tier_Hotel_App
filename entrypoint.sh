#!/bin/bash
set -e

# Add an initial short sleep to give SQL Server process a moment to start
echo "$(date) - Initializing... waiting a bit for SQL Server process to start."
sleep 10 # Initial sleep

# Wait for SQL Server port 1433 to be listening
echo "$(date) - Waiting for SQL Server to be ready on port 1433..."
until nc -zvw30 localhost 1433 # Check every 30 seconds for up to 300 seconds (approx)
do
    echo "$(date) - SQL Server port 1433 is not listening - sleeping for 5 seconds"
    sleep 5
done

echo "$(date) - SQL Server port 1433 is listening - attempting connection with sqlcmd"

# Now that the port is open, try sqlcmd to ensure it's fully responsive
/opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "$MSSQL_SA_PASSWORD" -Q "SELECT 1" -h -1 -t 60 # Removed > /dev/null
while [ $? -ne 0 ]
do
    echo "$(date) - SQL Server is responsive check failed - sleeping for 5 seconds"
    sleep 5
    /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "$MSSQL_SA_PASSWORD" -Q "SELECT 1" -h -1 -t 60 # Removed > /dev/null
done


echo "$(date) - SQL Server is up and responsive - executing initialization script"

# Execute the initialization script
/opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "$MSSQL_SA_PASSWORD" -i /docker-entrypoint-initdb.d/full_init.sql -N -C -t 300

echo "$(date) - SQL Server initialization script executed"

# Start the actual SQL Server process (from the base image's default entrypoint)
exec /opt/mssql/bin/sqlservr