
#!/bin/bash
set -e

mongo <<EOF
use test_db
db.createUser({
  user:  '$MONGO_INITDB_ROOT_USERNAME',
  pwd: '$MONGO_INITDB_ROOT_PASSWORD',
  roles: [
   {
      role: 'userAdmin',
      db: 'test_db'
    },
    {
      role: 'readWrite',
      db: 'test_db'
    }
  ]
})
EOF