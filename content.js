const WOED_SPAN_DATA_ATTRIBUTE = 'extension-word-data'
const CLONE_CAPTION_WINDOW_ID = 'extension-clone-caption-window'
const ENG_WORD_SPAN_CLASS = 'extension-word-span'
TIMEOUT_DULATION = 300

console.log("started")

function removeCloneCaption(){
    const clone = document.getElementById(CLONE_CAPTION_WINDOW_ID)
    if(clone){
      clone.remove()
    }
  }
  
function addCloneCaption(original){
if(!original) return

const clone = original.cloneNode(true)
clone.id = CLONE_CAPTION_WINDOW_ID
original.parentElement.appendChild(clone)
}

function getCloneCaption(){
    return document.getElementById(CLONE_CAPTION_WINDOW_ID)
  }

  // let count =1 ;

const captionObserver = new MutationObserver( () => {
    removeCloneCaption()
    
    let captionWindow = document.querySelector('div[id*="caption-window"] > div[class*="caption-window ytp-caption-window-bottom"]')
    // console.log(++count)
  
    if (captionWindow === null) {
      console.log("going back");
      return;
    }

    captionObserver.disconnect();
  
    captionWindow.style.display = 'block'
    addCloneCaption(captionWindow)
    captionWindow.style.display = 'none'
  
    const captionList = getCloneCaption().querySelectorAll('span > span > span')
    for(const line of captionList){
      const text = line.textContent
      if(text === null)continue;
  
      line.innerHTML = null
      const separator = /([^a-zA-Z_0-9\.\’\']+|\.\.\.|\.\.|'')/
      const wordList = text.split(separator)
      let newInnerHTML = ''
      for(const word of wordList){
        let validWord = ''
        let colonCounter = 0
        for(const char of word){
          if(isAlphabetOrNum(char) || WHITLIST_CHARS.includes(char)){
            validWord += char
            if(char === '.'){
              colonCounter ++
            }
          }
        }
  
        if(validWord[validWord.length-1] === '.'){
          validWord = validWord.slice(0, -1)
        }
        
        const wordSpanElm = document.createElement('span')
        wordSpanElm.innerHTML = validWord
        // wordSpanElm.style.color = 'voilet'
        wordSpanElm.className = ENG_WORD_SPAN_CLASS
        wordSpanElm.setAttribute(WOED_SPAN_DATA_ATTRIBUTE, text);
        const replaced = wordSpanElm.outerHTML
        if(word.length === colonCounter){
          newInnerHTML += word
        }else{
          newInnerHTML += word.replace(validWord, replaced)
        }
      }
      line.innerHTML = newInnerHTML
    }
  
    const spanList = document.querySelectorAll('.'+ENG_WORD_SPAN_CLASS)
    for(const span of spanList){
      span.onmouseenter= (event)=>{mouseEnterEvent(span.textContent, event)}
      span.onmouseleave = (event)=>{mouseLeaveEvent(event.currentTarget)}
      span.onclick = (event)=>{mouseClickEvent(span.textContent,event)}
    }
  
    captionObserver.observe(captionWindow.parentElement.parentElement, {
      childList: true,
      subtree: true
    })
  
  })


function mouseEnterEvent(word, event){
  element = event.currentTarget
  // console.log(element)
    event.preventDefault();
    let video = document.getElementsByTagName('video');
    video[0].pause();
  
  element.style.cssText = "background-color: rgba(91, 8, 199, 0.5) !important;  border-radius: 50px !important; "

}

function mouseLeaveEvent(element){
  element.style.cssText = "";
  let video = document.getElementsByTagName('video');
    video[0].play();
}

function mouseClickEvent(word,event){
  // console.log(word);
  event.preventDefault();

  try{
    dboxes = document.querySelectorAll(".dbox");
    for (let dbox of dboxes){
      dbox.remove();
      console.log("removed");
    }
  }catch(err){
    console.log(err)
  }

  let container = document.getElementById("ytp-caption-window-container")

  let box = document.createElement("div");
  box.className = "dbox"
  box.style.cssText = "color: black; border: 2px solid rgba(255, 0,0, 1); width:30%; position: absolute; padding: 10px; margin: 20px; border-radius: 20px; z-index: 9999 !important; background-color: rgba(255, 255, 255, 1) !important;"

  let header = document.createElement("div");
  header.style.cssText = "display: flex; justify-content:center";
  dcross = document.createElement("h2");
  dcross.className = "dcross";
  dcross.innerHTML = "SuperSub 🦸🏻‍♂️"

  dbody = document.createElement("div")
  dbody.innerHTML = "Please wait 🙏🏻"
  dbody.style.cssText = "margin-top: 10px;"

  container.appendChild(box);
  box.appendChild(header);
  header.appendChild(dcross);
  box.appendChild(dbody);
 
  chrome.runtime.sendMessage(word, function (response){
    // console.log(response)

    if(response["status"]==="success"){

      try{
        dbody.innerHTML = ""

        word = document.createElement("h3");
        word.className = "word";
        word.innerHTML = response["word"]
        dbody.appendChild(word)
  
        pos = document.createElement("div");
        pos.className = "pos";
        pos.style.cssText = "color: rgba(0,0,0,0.75)"
        pos.innerHTML = response["pos"]
        dbody.appendChild(pos)
  
        definition = document.createElement("div");
        definition.className = "definition";
        definition.innerHTML = `> Definition : ${response['definition']}`
        definition.style.cssText = "margin-top:10px;";
        dbody.appendChild(definition)

        try{

          if (response['example'] === undefined){
            throw "No example available";
          } 
          example = document.createElement("div");
          example.className = "example";
          example.innerHTML = `> Example : ${response['example']}`
          example.style.cssText = "margin-top:10px;";
          dbody.appendChild(example)
        }catch(err){
          console.log(err)
        }
  
  
  
  
      }catch{
        dbody.innerHTML = ""
        sorry = document.createElement("div");
        sorry.className = "sorry";
        sorry.innerHTML = "Sorry! something went wrong!"
        dbody.appendChild(sorry)

      }
    }
    else{
      dbody.innerHTML = ""

      sorry = document.createElement("div");
      sorry.className = "sorry";
      sorry.innerHTML = "Sorry! something went wrong!"
      dbody.appendChild(sorry)

    }
   
  });
  


}


const WHITLIST_CHARS = [
  "'", "’", '.'
]




function isAlphabetOrNum(str){
  if(str){
    return /^[A-Za-z0-9]*$/.test(str)
  }else{
    return false
  }
}



function setCaptionObserver(){
  const captionWindow = document.querySelector('div[id*="caption-window"]')


  captionObserver.observe(captionWindow.parentElement.parentElement, {
    childList: true,
    subtree: true
  })
}

let subtitleBtn = document.querySelector(".ytp-subtitles-button")
let pressed = subtitleBtn.getAttribute("aria-pressed")

console.log(subtitleBtn);


subtitleBtn.addEventListener("click", (e)=>{
  let pressed = subtitleBtn.getAttribute("aria-pressed");
  if(pressed === "true"){
    console.log(pressed);
    setCaptionObserver()
  }else{
    captionObserver.disconnect()
  }
});



var playBtn = document.querySelector('.ytp-play-button');

var observer = new MutationObserver(() => {

  let title = playBtn.getAttribute("title");
  console.log(title) 

  if(title === "Pause (k)"){

      dboxes = document.querySelectorAll(".dbox");
      for (let dbox of dboxes){
        dbox.remove();
        console.log("removed");
      }
    }
  
  
});

observer.observe(playBtn, {
  attributes: true //configure it to listen to attribute changes
});



