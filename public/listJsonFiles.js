const fs = require('fs');
const path = require('path');

const rootDirectory = '.'; // Replace with your actual directory
let jsonFiles = [];

let domain = "https://ne.freemap.online/"

function findJsonFiles(directory) {
    fs.readdirSync(directory, {withFileTypes: true}).forEach(entry => {
        const entryPath = path.join(directory, entry.name);
        if (entry.isDirectory()) {
            findJsonFiles(entryPath);
        } else if (entry.isFile() && entry.name.endsWith('.json')) {
            jsonFiles.push(entryPath);
        }
    });
}

findJsonFiles(rootDirectory);

// Write the JSON files paths to index.json
fs.writeFileSync('index.json', JSON.stringify(jsonFiles, null, 2));

// Generate index.html

let ids
let times = []
let features = []
let gotCache = false;
try {
    let cachedF = JSON.parse(fs.readFileSync("../features.json"))
    console.log("Found ", cachedF.length, " cached features vs urls: ", jsonFiles.length);
    console.assert(cachedF.length == jsonFiles.length)
    if (cachedF) {
        features = cachedF;
        gotCache = true;
    }
} catch (e) {
    console.warn("No cached features failed to load dat shit ")
}


const linksHtml = jsonFiles.map((file, index) => {
    let f;

    if (gotCache) {
        f = features[index];
    } else {
        let now = Date.now()
        let json = fs.readFileSync(file)
        let data = JSON.parse(json);
        let dt = Date.now() - now
        times.push(dt)

        // now = Date.now()
        // getFirstFeatureOrFalse(file).then(d=>{
        //     let ddt = Date.now()-now
        //     console.log(ddt, "ms to get first only async",d)
        // })

        console.log("JSON LOAD TOOK: ", dt, "for filoe: ", file);
        if (!data || !data.features || !data.features[0]) { // not a feature collection
            return console.log("skiping not a feature collection!", file)
        }
        f = data.features[0]

        features[index] = f;
    }
    if (!f) { // not a feature collection
        return console.log("skiping not a feature collection!", file)
    }
    let humanInfo = "Feature Geometry Type: " + f.geometry.type;

    console.log(humanInfo);

    humanInfo += " Properties: [" + Object.keys(f.properties).join(", ") + "]"

    let defaultColor = "#000096"
    const url = domain + file; // Modify this if you need to transform the file path into a URL
    return `
    <li id="style${index}" style="padding: 1em">
            <a href="${url}" target="_blank">${file}</a> - 
            <button onclick="navigator.clipboard.writeText('${url}')">Copy URL</button> - 
            <a href="https://freemap.online/zenVector.html?url=${url}" target="_blank">View In JSON Simplifier</a>
            
            <details>
            <summary>
                        Style: ${humanInfo}
                        <div class="mydemo" style="background: ${defaultColor + "80"}; 
                        border: 3px solid;
                        border-color: ${defaultColor + "6E"}">
                        <span style="padding: 5px">Sample Style Rendering</span></div>
            </summary>
            
            <input type="color" name="fill" value="${defaultColor}">    
             <input type="range" name="opacity" value="0.5" min="0" max="1" step="0.02">
             
             <input type="range" name="radius" min="0" value="14" max="1" step="0.01">

<span>Fill Color, Opacity, Circle radius: </span><span class="f"></span>
             <br>
            <input type="color" name="strokeColor" value="${defaultColor}E6">
            
            <input type="range" name="strokeOpacity" value="0.9" min="0" max="1" step="0.004">

            <input type="range" name="stroke" min="0" value="3" max="1" step="0.01">
            <span>Stroke Color, Opacity, Weight: </span><span class="s"></span>

            <br>
            
            <input type="color" name="labelC" value="#00ff00">
            
            <input type="range" name="labelO" value="0" min="0" max="1" step="0.004">

            <input type="range" name="labelS" min="0" value="0" max="1" step="0.004">
            <span>Label Color, Opacity, Font Size: </span><span class="l"></span>

            <br>
            
            <input type="text" name="label" placeholder="Enter label Property">
          
          
            <details>
            <summary>
                   Sample Feature Properties
            </summary>
            <pre>
${JSON.stringify(f.properties, null, 2)}
</pre>
            </details>
            <input type="text" name="urlayer">
            
            <button name="open"> View on FreeMap</button>
             </details>

      </li>
`;
}).join('\n');

const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>GeoJSON Files Index</title>
<!--    <link rel="stylesheet" href="https://unpkg.com/water.css/out/water.css">-->
</head>
<body style="padding: 2em; ">

    <h1>GeoJSON Files Index</h1>
<p>Welcome to the FreeMap Sample Data Portal! This platform is your gateway to a treasure trove of 
Natural Earth data and additional resources, all freely available under Creative Commons licenses. 
Our mission is to empower users like you to leverage this data for the greater good, 
sparking innovation and inspiring possibilities across a multitude of applications, 
from environmental conservation to urban planning.</p>
<p>To embark on this journey, simply select a data layer that intrigues you.
 Next, create a visually appealing style for it. Finally, click the "View in FreeMap" 
 button to access the data directly. Our user-friendly process is designed to facilitate 
 seamless integration with online tools and platforms, empowering you to make a difference.</p>
<p>Accessibility is at the heart of our mission. As such, all links are provided with 
descriptive titles and aria-labels for screen reader users. Please note: Our datasets, 
originally sourced from 
<a href="https://naturalearth.com" target="_blank" 
title="Visit Natural Earth for more geographic data" 
aria-label="Visit Natural Earth for more geographic data">Natural Earth</a>, 
have been optimized for cloud storage, ensuring those larger than 25MB are easily accessible. 
This makes it easier than ever to link the data directly to online tools, such as 
<a href="https://freemap.online/map42" target="_blank" 
title="Explore maps on FreeMap online" 
aria-label="Explore maps on FreeMap online">freemap.online</a>, 
empowering you to explore the full potential of geographic analysis.</p>

    
    <div style="position: relative; padding-top: 61.16700201207244%;">
  <iframe
    src="https://customer-xo9g3kj43f96x9nl.cloudflarestream.com/5dc5ea3a37f4f2fb5c1c6817fd3d9d4b/iframe?poster=https%3A%2F%2Fcustomer-xo9g3kj43f96x9nl.cloudflarestream.com%2F5dc5ea3a37f4f2fb5c1c6817fd3d9d4b%2Fthumbnails%2Fthumbnail.jpg%3Ftime%3D%26height%3D600&title=NE.FreeMap.Online+Style+Demo%2FTutorial&share-link=https%3A%2F%2Fne.freemap.online&channel-link=https%3A%2F%2Ffreemap.online"
    loading="lazy"
    style="border: none; position: absolute; top: 0; left: 0; height: 100%; width: 100%;"
    allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
    allowfullscreen="true"
  ></iframe>
</div>
    <ul>
        ` + linksHtml + `
    </ul>
    
    <script defer>
   
    
    let lis = Array.from(document.querySelectorAll("li"))
    
  
    lis.forEach(el=>{
        
                      //Fill props
                let fill = el.querySelector("input[name='fill']") 
                let op = el.querySelector("input[name='opacity']") 
                let r = el.querySelector("input[name='radius']") 

//stroke props
                let strokeC = el.querySelector("input[name='strokeColor']") 
                let strokeO = el.querySelector("input[name='strokeOpacity']") 
                let stroke = el.querySelector("input[name='stroke']") 
              // label props  
                let labelC = el.querySelector("input[name='labelC']") 
                let labelO = el.querySelector("input[name='labelO']") 
                let labelS = el.querySelector("input[name='labelS']") 
                let label = el.querySelector("input[name='label']") 
                
                //sample style div
                let demo = el.querySelector(".mydemo")
                let span = demo.querySelector("span")
                 
                 let spans = {
                    f: el.querySelector("span.f") ,
                    s: el.querySelector("span.s") ,
                    l: el.querySelector("span.l") ,
                    
                 }
                 console.log(r);
                let urlayer = el.querySelector("input[name='urlayer']") 
                let open = el.querySelector("button[name='open']") 
                let a = el.querySelector("a") 
            


                function co2rgba(c, o) {
                   return c +  Math.round(parseFloat(o) * 255).toString(16).padStart(2, '0');// 0 -> 00 1->FF
                }
                const encjs = data => encodeURIComponent(JSON.stringify(data));
                const decjs = enc => JSON.parse(decodeURIComponent(enc));
                
                        // let urlayer = "u="++ &f=#101010ff42&s=#111111ee02&l=#99ff990012$name";

                const getFill = ()=>{
                    spans.f.innerText = co2rgba(fill.value, op.value) +  parseInt(r.value *99).toString().padStart(2, '0')
                    return "f="+  spans.f.innerText
                }
                const getStroke = ()=>{
                    spans.s.innerText = co2rgba(strokeC.value, strokeO.value) + parseInt(stroke.value * 99).toString().padStart(2, '0')
                    return "s="+ spans.s.innerText
                }
                const getLabel = ()=>{ 
                    spans.l.innerText = co2rgba(co2rgba(labelC.value, labelO.value), labelS.value) + "$" +label.value
                    return "l="+ spans.l.innerText
                }


                open.addEventListener("click", e=>{
                    
                    let daParam = "u="+a.href + "&"+ getFill() + "&"+ getStroke() + "&"+ getLabel()
                    let urlayers = encjs([daParam]);
                    console.log(urlayers)
                    let shre_url = "https://freemap.online/map42/?cfairport=1&urlayers="+urlayers;
                    
                    navigator.clipboard.writeText(shre_url);
                    
         
                    let yeahDoit = confirm("You freemap url has been copied to clipboard. Will now navigate you there ");
                    if(yeahDoit) {
                        
                        window.open(shre_url,'_blank');
                    }
                    console.log(yeahDoit);
                })
                
                let urlayerParam  = "u=" + a.href+"&f=" +  co2rgba(fill.value, op.value) + parseInt(r.value).toString(16).padStart(2, '0');
                urlayerParam += "&s=" +  co2rgba(strokeC.value, strokeO.value) + stroke
                
                urlayerParam += "&" + getLabel()
                
                console.log("urlayerParam: ", urlayerParam);
                
                let urlayers = [urlayerParam]
     
                // function qsa
                let shareUrl = "https://freemap.online/map42/?cfairport=1&urlayers=" + encjs(urlayers);
                
                
                /////////////////////////////////////////
                // Label Events
                ////////////////////////////////////////
                labelC.addEventListener("input", e=>{
                    let o = labelO.value;
                        if(o < 0.02) {
                            //mode solid color on transparent background
                             span.style.color = labelC.value;
                             span.style.background = "transparent";
                        }
                        else { // black on collored  with opacity background 
                             span.style.color = "#000000"; 
                             span.style.background = co2rgba(labelC.value, labelO.value);
                        }
                                            console.log(demo,getLabel())      

                })
                
                labelO.addEventListener("input", e=>{
                    let o = labelO.value;
                    if(o < 0.02) {
                        //mode solid color on transparent background
                         span.style.color = labelC.value;
                         span.style.background = "transparent";
                    }
                    else { // black on collored  with opacity background 
                         span.style.color = "#000000"; 
                         span.style.background = co2rgba(labelC.value, labelO.value);
                    }
                                        console.log(demo,getLabel())      

                  })
                
                labelS.addEventListener("input", e=>{
                    let s =  co2rgba("", labelS.value) + "px"      
                    demo.style.fontSize = s
                    getFill()
                    console.log(demo,getLabel())      
                })
                console.log(shareUrl);
                
                
                /////////////////////////////////////////
                // Fill Events
                ////////////////////////////////////////
                fill.addEventListener("input", e=>{
                    demo.style.background = co2rgba(fill.value, op.value)
                    // demo.style.borderColor = fill.value
                                        console.log(demo,getFill())      

                })
                
                op.addEventListener("input", e=>{
                   demo.style.background = co2rgba(fill.value, op.value)
                                                           console.log(demo,getFill())      

                })
                    r.addEventListener("input", e=>{
                   // demo.style.background = 
                                                           console.log(demo,getFill())      

                }) 
                
                //////////////////////////////////////////////
                //STROKE EVENTS
                /////////////////////////////////////////////
                strokeO.addEventListener("input", e=>{
      
                   demo.style.borderColor = co2rgba(strokeC.value, strokeO.value)
                                                            console.log(demo,getStroke())      

                })
                
                strokeC.addEventListener("input", e=>{
                    // demo.style.background = fill.value;
                    
                    demo.style.borderColor = co2rgba(strokeC.value, strokeO.value)
                                                            console.log(demo,getStroke())      

                })
                stroke.addEventListener("input", e=>{
                    demo.style.borderWidth = parseInt(stroke.value*24) + "px";
                                                            console.log(demo,getStroke())      

                })
                // demo.style.opacity = op
               
    
    })
    
    // is.forEach() 
    
    
   </script>
</body>
</html>
`;

fs.writeFileSync('index.html', htmlContent);

fs.writeFileSync('../features.json', JSON.stringify(features));
