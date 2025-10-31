#!/bin/bash
# Script to link Supabase project with password from environment

cd /Users/peter/code/yun-admin

# Read password from environment or use provided one
PASSWORD="${NEXT_SUPABASE_DB_PASSWORD:-IDG5YFjDPOGIteFX}"

# Use expect to automate password entry
expect << EOF
spawn supabase link --project-ref ripcvdgfrecjhtgverdv
expect "Enter your database password (or leave blank to skip):"
send "$PASSWORD\r"
expect {
    "Linked to project" {
        puts "Successfully linked!"
        exit 0
    }
    timeout {
        puts "Command timed out or failed"
        exit 1
    }
    eof
}
EOF

