let currentSong = new Audio();
let public;
let songs;
let currfolder;
function secondsToMinutesSeconds(seconds) {
    // Ensure the input is a valid number
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    // Calculate minutes and remaining seconds
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    // Format the result with leading zeros
    const formattedMinutes = minutes < 10 ? `0${minutes}` : `${minutes}`;
    const formattedSeconds = remainingSeconds < 10 ? `0${remainingSeconds}` : `${remainingSeconds}`;

    // Combine minutes and seconds in the "mm:ss" format
    const result = `${formattedMinutes}:${formattedSeconds}`;

    return result;
}

async function getsongs(folder) {
    currfolder = folder;
    let a = await fetch(`/public/${folder}/`)
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response;
    let as = div.getElementsByTagName("a")
    songs = []
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1])
        }
    }
    //play the first song

    //show all the songs in the playlist
    let songUL = document.querySelector(".Songlist").getElementsByTagName("ul")[0]
    songUL.innerHTML = ""
    for (const song of songs) {
        songUL.innerHTML = songUL.innerHTML + `<li> 
         <img class= "invert" src="/public/img/music.svg" alt="">
                             <div class="info">
                             <div>${song.replaceAll("%20", " ")}</div>
                                 <div>delux</div>
                             </div>
                             <div>
                                 <span>Play Now</span>
                             <img class= "invert" src="/public/img/play.svg" alt="">
                             </div>
          </li>`;
    }
    //attach an event listener to each song
    Array.from(document.querySelector(".Songlist").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            console.log(e.querySelector(".info").firstElementChild.innerHTML)
            playmusic(e.querySelector(".info").firstElementChild.innerHTML)
        })

    })
    return songs

}
const playmusic = (track, pause = false) => {
    //let audio = new Audio("/songs/"+ track)
    currentSong.src = `/public/${currfolder}/` + track
    if (!pause) {
        currentSong.play()
        play.src = "/public/img/pause.svg"
    }

    document.querySelector(".songinfo").innerHTML = decodeURI(track)
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00"

}
async function displayAlbums() {
    let a = await fetch(`/public/songs/`)
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a")
    let cardContainer = document.querySelector(".cardContainer")
    let array = Array.from(anchors)
    for (let index = 0; index < array.length; index++) {
        const e = array[index];
        if (e.href.includes("/public/songs/")) {
            folder = e.href.split("/").slice(-2)[1]
            //get the metadata of the folder
            let a = await fetch(`/public/songs/${folder}/info.json`)
            let response = await a.json();
            console.log(response)
            cardContainer.innerHTML = cardContainer.innerHTML + `<div data-folder= "${folder}"  class="card">
            <div class="play">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
                    xmlns="http://www.w3.org/2000/svg">
                    <path
                        d="M18.8906 12.846C18.5371 14.189 16.8667 15.138 13.5257 17.0361C10.296 18.8709 8.6812 19.7884 7.37983 19.4196C6.8418 19.2671 6.35159 18.9776 5.95624 18.5787C5 17.6139 5 15.7426 5 12C5 8.2574 5 6.3861 5.95624 5.42132C6.35159 5.02245 6.8418 4.73288 7.37983 4.58042C8.6812 4.21165 10.296 5.12907 13.5257 6.96393C16.8667 8.86197 18.5371 9.811 18.8906 11.154C19.0365 11.7084 19.0365 12.2916 18.8906 12.846Z"
                        stroke="#141B34" fill="#000" stroke-width="1.5" stroke-linejoin="round" />
                </svg>
            </div>
            <img src="/public/songs/${folder}/cover.jpg" alt="">
            <h2>${response.title}</h2>
            <h6>${response.description}</h6>
        </div>`





        }
    }
    //load the playlist when card is clicked
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            songs = await getsongs(`songs/${item.currentTarget.dataset.folder}`)
            playmusic(songs[0])
        })
    })



}
async function main() {

    //listing the audio
    await getsongs("songs/Top44englishsongs")
    playmusic(songs[0], true)

    //display all the albums on the page
    await displayAlbums()

    //attach an event listener to next,play and previous
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play()
            play.src = "/public/img/pause.svg"  
        }
        else {
            currentSong.pause()
            play.src = "/public/img/play.svg"
        }
    })
    //listen for time update event
    currentSong.addEventListener("timeupdate", () => {
        console.log(currentSong.currentTime, currentSong.duration);
        document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)}/${secondsToMinutesSeconds(currentSong.duration)}`
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%"
    })
    //add a event listener to seekbar
    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = ((currentSong.duration) * percent) / 100
    })
    //add an event listener for hamburger
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0"
    })
    //add an event listener for close button
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%"
    })
    //add an event listener for previous
    previous.addEventListener("click", () => {
        console.log("previous clicked")
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if ((index - 1) >= 0) {
            playmusic(songs[index - 1])
        }
    })
    //add an event listener for next
    next.addEventListener("click", () => {
        console.log("next clicked")
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if ((index + 1) < songs.length - 1) {
            playmusic(songs[index + 1])
        }
    })
    //add event to volume
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        currentSong.volume = parseInt(e.target.value) / 100
    })
    //add event listener to mute the track
    document.querySelector(".volume>img").addEventListener("click", e => {
        if (e.target.src.includes("volume.svg")) {
            e.target.src = e.target.src.replace("volume.svg", "mute.svg")
            currentSong.volume = 0;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
        }
        else {
            e.target.src = e.target.src.replace("mute.svg", "volume.svg")
            currentSong.volume = .10;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 10;
        }
    })



}
main()