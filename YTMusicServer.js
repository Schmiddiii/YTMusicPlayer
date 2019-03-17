

const pup = require("puppeteer")
const jsonfile = require("jsonfile")
const express=require("express")
const fs=require("fs")

const app=express();


var actionsInLastMins=0;
var playing=true;

function makeAction(page){
    actionsInLastMins++
    setTimeout(() => {
        actionsInLastMins--
        if(actionsInLastMins<=0&&!playing){
            browser.close();
            throw new Error();
        }
    }, 300000);
}


async function ServerRestart(){
    const settings=await JSON.parse(fs.readFileSync("settings.json"))
    createPage(settings)
    .then(p=>{
        
        app.listen(settings.port,()=>{
            console.log("Listening on "+settings.port)
        })
        app.get("/playpause",(req,res)=>{
            playpause(p)  
            res.end("Played/Paused")
        })
        app.get("/skip",(req,res)=>{
            skip(p)
            res.end("Skiped")
        })

        p.evaluate(()=>{
            var alreadyAd=false
            var observer = new MutationObserver(function(mutations) {
                mutations.forEach(function(mutation) {
                    if(mutation.target.className.split(" ").indexOf("ad-showing")!=-1&&!alreadyAd){
                        alreadyAd=true
                        setTimeout(()=>{
                          var skipBtn=document.getElementsByClassName("ytp-ad-skip-button")[0]
                          skipBtn.click();
                          alreadyAd=false
                      },5000)
                  }
                });    
              });
              observer.observe(document.getElementById("movie_player"),{attributes:true})
        }).then(videoPlayer=>{

        })


        return p
    })
    .catch(err=>{
        console.log(err)
    })
}



async function createPage(settings) {
    //const settings=await JSON.parse(fs.readFileSync("settings.json"))

    const browser = await pup.launch({
        headless: true,
        ignoreDefaultArgs: ['--mute-audio']
    })
    const page = await browser.newPage()

    var cookies = settings.cookies
    await page.setCookie(...cookies)
    if(settings.playlist=="HOTLIST"){
        await page.goto("https://music.youtube.com")


        await page.waitForSelector("#play-button",{visible:true})
    
        await page.click("#play-button")
    
        await page.waitForNavigation()
    
        return page
    }
    await page.goto(settings.playlist)
    await page.waitForSelector(".yt-simple-endpoint .style-scope .yt-button-renderer",{visible:true})
    await page.click(".yt-simple-endpoint .style-scope .yt-button-renderer")

    if(settings.loop){
        await page.waitForNavigation()
        await page.evaluate(()=>{
            document.querySelector(".repeat").click()
        })
    }
    return page
    
}

async function playpause(page){
    playing=!playing
    await page.click("#play-pause-button")
    makeAction(page)
}
async function skip(page){
    makeAction(page)
    await page.click(".next-button")
}





module.exports.restart=ServerRestart