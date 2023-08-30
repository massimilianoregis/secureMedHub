examples:
>when: 
>- GET /2021-08/user/login  
>
>send a notification  
>- **data**:  
> from: response.user.id  
> to: response.vet.id   
> id: response.id   
> workflow: Basic   
> email: request.email  
> template: 'vet'  
> group: 'account activity'

>when: 
>- POST /2021-08/test/(<?id>.*?)/submit
>
>send a notification  
>- **data**:   
> from: response.user.id  
> to: response.vet.id  
> id: request.id
> workflow: Basic   
> email: request.email  
> template: 'vet'
> group: 'vet activity'

all the input params will be stored over request data  
all the output params will be stored over response data  

user subscription:  
- group: 'vet activity'  
- group: 'account activity'  

## configuration
the 'points of cut' are wired over configuration file, is not needed a dbase for that (probably is better)

config.js  
```json
 [    
   {
       cut:'POST /2021-08/requisitionForm/:id/submit',
       data:{
           to:'request.user',
           id:'request.id',
           group:'',
           template:'requisitionSubmitted'
       }
    },
    {
        cut:'POST /2021-08/requisitionForm/:id',
        data:{
           to:'request.user',
           id:'request.id',
           template:'requisitionCreation'
       }
    }
 ] 
```

dbase configuration  
```
user_id {allowed:[{group:''}]}
```
## implementation