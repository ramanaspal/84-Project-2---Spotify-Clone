console.log("its time for Javascript");
let currentsong = new Audio();
let songs;
let currfolder

function formatTime(seconds) {
  if (isNaN(seconds) || seconds < 0) {
    return "00:00";
  }
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  const formattedMinutes = String(minutes).padStart(2, '0');
  const formattedSeconds = String(remainingSeconds).padStart(2, '0');

  return `${formattedMinutes}:${formattedSeconds}`;
}

async function getsongs(folder) {
  currfolder = folder;
  let a = await fetch(`/${folder}/`);
  let response = await a.text();
  console.log(response);
  let div = document.createElement("div");
  div.innerHTML = response;
  let as = div.getElementsByTagName("a");
  songs = [];
  for (let index = 0; index < as.length; index++) {
    const element = as[index];
    if (element.href.endsWith(".m4a")) {
      songs.push(element.href.split(`/${folder}/`)[1]);
    }
  }

  


  //showing songs in the playlist
  let songUL = document.querySelector(".songlist").getElementsByTagName("ul")[0];
  songUL.innerHTML = ""

  for (const song of songs) {
    songUL.innerHTML =songUL.innerHTML + `<li>  <img class="invert" src="svg/music.svg" alt="">
                            <div class="info">
                                <div> ${song.replaceAll("%20", " ")} </div>
                            </div>
                            <div class="playnow">
                                <span>Play now</span>
                                <img class="invert" src="svg/playsong.svg" alt="Play now">
                            </div> </li>`;
  }



  //Ataching event listener to each song
  Array.from(document.querySelector(".songlist").getElementsByTagName("li")).forEach(e => {
    e.addEventListener("click", element => {
      playmusic(e.querySelector(".info").firstElementChild.innerHTML.trim())
    })
  })
  return songs
}

const playmusic = (track, pause = false) => {
  currentsong.src = `/${currfolder}/` + track
  if (!pause) {
    currentsong.play()
    play.src = "svg/pause.svg"

  }
  document.querySelector(".songinfo").innerHTML = decodeURI(track)
  document.querySelector(".songtime").innerHTML = "00:00 / 00:00"
}


async function displayAlbum() {
  console.log("displaying albums")
  let a = await fetch(`/songs/`);
  let response = await a.text();
  let div = document.createElement("div");
  div.innerHTML = response;
  let anchors = div.getElementsByTagName("a")
  let cardcontainer = document.querySelector(".cardcontainer")
  let array = Array.from(anchors)
    for (let index = 0; index < array.length; index++) {
      const e = array[index];
      


    if(e.href.includes("/songs")){
      let folder = e.href.split("/").slice(-2)[0]

      //get the metadata of the folder
      let a = await fetch(`/songs/${folder}/info.json`);
      let response = await a.json();

      cardcontainer.innerHTML = cardcontainer.innerHTML + `<div data-folder="${folder}" class="card">
              <div class="play">
                <svg
                  xmlns="http://www.w3.org/2000/svg" data-encore-id="icon" role="img" aria-hidden="true" viewBox="0 0 24 24" fill="black" class="Svg-sc-ytk21e-0 bneLcE" width="26" height="26">
                  <path
                    d="m7.05 3.606 13.49 7.788a.7.7 0 0 1 0 1.212L7.05 20.394A.7.7 0 0 1 6 19.788V4.212a.7.7 0 0 1 1.05-.606z"
                  ></path>
                </svg>
              </div>
              <img src="/songs/${folder}/cover.jpg" alt="" />
              <h3>${response.title}</h3>
              <p>${response.description}</p>
            </div>`
    }
  }

   //load the playlist whenever card clicked
   Array.from(document.getElementsByClassName("card")).forEach(e => {
    e.addEventListener("click", async item => {
      songs = await getsongs(`songs/${item.currentTarget.dataset.folder}`)
      playmusic(songs[0])

    })
  })
}

async function main() {

  //get the list of songs
  await getsongs("songs/Latest");
  console.log(songs);
  playmusic(songs[0], true)

  //display all album on page
  displayAlbum()

  //attach event listener to next and previous
  play.addEventListener("click", () => {
    if (currentsong.paused) {
      currentsong.play()
      play.src = "svg/pause.svg"
    }
    else {
      currentsong.pause();
      play.src = "svg/play.svg"
    }
  })

  //timeupdate

  currentsong.addEventListener("timeupdate", () => {
    document.querySelector(".songtime").innerHTML = `${formatTime(currentsong.currentTime)} / ${formatTime(currentsong.duration)}`
    document.querySelector(".circle").style.left = (currentsong.currentTime / currentsong.duration) * 100 + "%"
  })
  //add event listener to seekbar

  document.querySelector(".seekbar").addEventListener("click", (e) => {
    let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100
    document.querySelector(".circle").style.left = percent + "%";
    currentsong.currentTime = ((currentsong.duration) * percent) / 100
  })

  //hamburger eventlistner
  document.querySelector(".hamburger").addEventListener("click", () => {
    document.querySelector(".left").style.left = "0"
  })

  //close event listener
  document.querySelector(".close").addEventListener("click", () => {
    document.querySelector(".left").style.left = "-120%"
  })

  //event listener for previous and next
  previous.addEventListener("click", () => {
    console.log("previous clicked")
    console.log(currentsong)
    let index = songs.indexOf(currentsong.src.split("/").slice(-1)[0])

    console.log(songs, index)
    if ((index - 1) >= 0) {
      playmusic(songs[index - 1])
    }
  })

  next.addEventListener("click", () => {
    currentsong.pause()
    console.log("next clicked")
    let index = songs.indexOf(currentsong.src.split("/").slice(-1)[0])

    console.log(songs, index)
    if ((index + 1) < songs.length) {
      playmusic(songs[index + 1])
    }
  })

  //volume eventlistener
  document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
    console.log("setting colume to ", e.target.value, " / 100")
    currentsong.volume = parseInt(e.target.value) / 100
    if (currentsong.volume > 0){
      document.querySelector(".volume>img").src = document.querySelector(".volume>img").src.replace( "mute.svg", "volume.svg")
    }
  })
  //mute the track 
  document.querySelector(".volume>img").addEventListener("click", e=>{
    if(e.target.src.includes("volume.svg")){
      e.target.src = e.target.src.replace("volume.svg", "mute.svg")
      currentsong.volume = 0;
      document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
    }
    else{
      currentsong.volume = .10
      e.target.src = e.target.src.replace( "mute.svg", "volume.svg")
      document.querySelector(".range").getElementsByTagName("input")[0].value = 10;
    }
  } )
 
}
main();
