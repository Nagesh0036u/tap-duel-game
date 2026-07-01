const socket = io();

const joinBox = document.getElementById("joinBox");
const gameBox = document.getElementById("gameBox");

const joinBtn = document.getElementById("joinBtn");
const playerName = document.getElementById("playerName");

const playerInfo = document.getElementById("playerInfo");
const status = document.getElementById("status");
const countdown = document.getElementById("countdown");

const tapBtn = document.getElementById("tapBtn");

const reaction = document.getElementById("reaction");
const result = document.getElementById("result");

const playAgain = document.getElementById("playAgain");

let startTime = 0;
let canTap = false;
let myName = "";

joinBtn.onclick = () => {

    myName = playerName.value.trim();

    if(myName===""){

        alert("Please enter your name");

        return;

    }

    joinBox.style.display="none";

    gameBox.style.display="block";

    status.innerHTML="Waiting for another player...";

    socket.emit("joinGame",myName);

};

socket.on("waiting",()=>{

    status.innerHTML="Waiting for another player...";

});

socket.on("startPlayers",(players)=>{

    playerInfo.innerHTML=
        players[0].name+
        " VS "+
        players[1].name;

});

socket.on("countdown",(num)=>{

    countdown.innerHTML=num;

});

socket.on("wait",()=>{

    countdown.innerHTML="WAIT...";

});

socket.on("go",()=>{

    countdown.innerHTML="GO!";

    tapBtn.disabled=false;

    tapBtn.classList.add("green");

    canTap=true;

    startTime=Date.now();

    if(navigator.vibrate){

        navigator.vibrate(200);

    }

});

tapBtn.onclick=()=>{

    if(!canTap) return;

    canTap=false;

    tapBtn.disabled=true;

    reaction.innerHTML=
    "Reaction Time : "+
    (Date.now()-startTime)+
    " ms";

    socket.emit("tap");

};

socket.on("winner",(winnerId)=>{

    tapBtn.classList.remove("green");

    playAgain.style.display="inline-block";

    if(socket.id===winnerId){

        result.innerHTML="🏆 YOU WIN";

    }else{

        result.innerHTML="😢 YOU LOSE";

    }

});

playAgain.onclick=()=>{

    location.reload();

};