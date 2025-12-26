# MongoDB Setup Guide

## Option 1: Local MongoDB

1. Install MongoDB locally
2. Start MongoDB service
3. In `.env` file, set:
```env
MONGODB_URI=mongodb://localhost:27017/erp_db
```

## Option 2: MongoDB Atlas (Cloud)

1. Create account at https://www.mongodb.com/cloud/atlas
2. Create a cluster
3. Get connection string
4. In `.env` file, set:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/erp_db
```

Replace:
- `username` - Your MongoDB Atlas username
- `password` - Your MongoDB Atlas password
- `cluster` - Your cluster name
- `erp_db` - Database name

## Example .env Configuration

```env
# For Local MongoDB
MONGODB_URI=mongodb://localhost:27017/erp_db

# OR For MongoDB Atlas
MONGODB_URI=mongodb+srv://your_username:your_password@cluster0.xxxxx.mongodb.net/erp_db?retryWrites=true&w=majority
```

## Troubleshooting

### Error: "URI must include hostname, domain name, and tld"
- Check that MONGODB_URI is properly formatted
- Make sure there are no extra spaces or quotes
- For Atlas, ensure the connection string includes the full cluster URL

### Error: "Connection timeout"
- Check if MongoDB service is running (for local)
- Check network/firewall settings
- Verify credentials are correct (for Atlas)

### Error: "Authentication failed"
- Verify username and password are correct
- Check if IP address is whitelisted in Atlas (if using Atlas)

