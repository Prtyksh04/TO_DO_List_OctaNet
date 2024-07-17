
const observer = new IntersectionObserver((entries )=> {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('show');
        } else {
          entry.target.classList.remove('show');
        }
    });
});

const hiddenElement = document.querySelectorAll('.leftr');

hiddenElement.forEach((el)=> observer.observe(el));

// cards

const caard = document.querySelectorAll('.caards');

const card = new IntersectionObserver((entries)=>{
  entries.forEach((entry)=>{
    if(entry.isIntersecting){
      entry.target.classList.add('show2');
    }else{
      entry.target.classList.remove('show2');
    }
  });
});

caard.forEach((el)=>card.observe(el));


function show(){
  let x = document.getElementById("password");
  if (x.type === "password") {
    x.type = "text";
  } else {
    x.type = "password";
  }
}


function showedit(id) {
  if(!id) return;
  console.log(`clicked id ${id}`);
  const show = document.getElementById(id);
  show.style.display="block";
}

function color(){
  console.log("loaded");
  
}

function addproject(){
  console.log("button got clicked");
  const show = document.getElementById("showproject");
  show.style.display="block";
}






