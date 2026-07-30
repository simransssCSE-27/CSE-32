console.log("Hello")

//variable

var name = "simran"
console.log(name) ; // can execute without semicolon but it is good practice to use semicolon 
// we can redeclare the variable  also we can reassign the variable value 


// let 
let a = 10 ;
console.log(a) ;
 // when we redeclare let then it will give error but we can reassign the value of let variable

 // constant 
 consta a="india" ;
 console.log(a) ;
 a ="usa" ;
 console.log(a) ;  //constant ki value change ho skti h using object and array 
  
//
 let b ;
  console.log(b) ; //undefined
   
  //object 
 let  s=(
    name : "simran",
    age : 20,

  )
  console.log(s) ;



  // const ki value change ho skti h
 
  const s=(
name : "simran",
age : 20
   );
   console.log(s) ;
    s.name="hushh";
    console.log(s) ; //object ki value change ho skti h but object ko reassign nhi kr skte h
    s.city="delhi" ;





    // array 

    const f=[apple,banana];
f.push("mango") ; 
f[0]="grapes";
consle.log(f) ; 

// TYPE OF ERROR 

console.log("h" //syntax error 
  console.log(name); //reference error
  const num=10;
  num();  //type error kyunki fn call kr rhe and fn bna hi nahi h
  num =20 ; //type error
   
  const arr=new Array(-5) ; //range error

  decodeURL (%) ; //URL error


