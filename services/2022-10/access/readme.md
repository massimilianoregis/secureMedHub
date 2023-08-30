# Access
This is the Authorization system
The purpose of this service is just validate the jwt and create a user object over the request object

those standard fiels will be checked in JWT:
- "iat": Issued at
- "nbf": Not valid Before
- "exp": Expiration time

# kick

```GET /2022-10/auth/kick/{email}```  
kick a user means: Revoke all his JWTs and force him to re-login  
the auth service will consider all the jwt with **nbf time** minor to the **current time** invalid  

### how it works in deep

a dbase record will be created composed by: userID, current date, expiration date  
expiration date is nothing else than current date+jwt expiration time  
expiration date exists just to obtain a strong optimization because after that date the record will be removed from the dbase  


# ban

```GET /2022-10/auth/ban/{email}```  
ban a user means: Revoke now and forver all the access connected to this user

### how it works in deep

a dbase record will be created composed by: userID  
all the access to this user will be revoked  

# blacklist

kick and ban are special records to blakclist dbase.  
it is possible to GET/PUT/POST/DELETE any kind of those dbase by `/2022-10/blacklist`
> delete a ban record means: revoke the ban

# jwt refresh

Since the JWT has an expiration time, it is necessary to update it to avoid the expiration that will make a new login necessary.  
the jwt will be refreshed at any single call by a response cookie added to any single response.  
the jwt will be refreshed without any dbase check: just with a new expiration time but same **nbt time**
why same **nbt time**?  
>  because in this way is possible to refresh a JWT without read the current role in the dbase.  (with a really strong performance enhancement)  
if the user is already kicked JWT will be invalidated in any case 

# endpoint permission

Right now the permission is granted by a ACL file that is able to map user role (single role) to each single endpoint  
__nacl.json__ under gateway root
```js
{
    "group": "user",
    "permissions": [
      {
        "resource": "test/*",
        "methods": "*",
        "action": "allow"
      }
    ]
}
```
