const fs = require('fs');
const path = require('path');

const rootDirectory = '.'; // Replace with your actual directory
let jsonFiles = [];

let domain = "https://ne.freemap.online/"

// const JSONStream = require('JSONStream');
//
//
//
// async function getFirstFeatureOrFalse(filePath) {
//     return new Promise((resolve, reject) => {
//         // Create a read stream from the file
//         const fileStream = fs.createReadStream(filePath, { encoding: 'utf8' });
//
//         // Use JSONStream to parse the stream
//         const parser = JSONStream.parse('features.*');
//
//         parser.on('data', function(feature) {
//             resolve(feature); // Resolve the promise with the first feature
//             parser.pause(); // Pause the parser to stop processing further
//             fileStream.unpipe(parser); // Unpipe the parser from the stream
//             parser.end(); // End the parser
//             fileStream.destroy(); // Destroy the file stream
//         });
//
//         parser.on('end', () => {
//             resolve(false); // Resolve with false if no data was found before the end of the stream
//         });
//
//         // Handle errors
//         fileStream.on('error', reject);
//         parser.on('error', reject);
//
//         // Pipe the file stream through the parser
//         fileStream.pipe(parser);
//     });
// }
//



function findJsonFiles(directory) {
    fs.readdirSync(directory, { withFileTypes: true }).forEach(entry => {
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
const linksHtml = jsonFiles.map((file, index) => {

    let now = Date.now()
    let json = fs.readFileSync(file)
    let data =JSON.parse(json);
    let dt = Date.now()-now
    times.push(dt)

    // now = Date.now()
    // getFirstFeatureOrFalse(file).then(d=>{
    //     let ddt = Date.now()-now
    //     console.log(ddt, "ms to get first only async",d)
    // })

    console.log("JSON LOAD TOOK: ", dt, "for filoe: ", file);
    if(!data || !data.features || !data.features[0]) { // not a feature collection
        return console.log("skiping not a feature collection!", file)
    }
    let f = data.features[0]

    features.push(f)

    let humanInfo = "Feature Geometry Type: "+ f.geometry.type;

    console.log(humanInfo);

    humanInfo += " Properties: ["+ Object.keys(f.properties).join(", ")+"]"

    let defaultColor = "#000096"
    const url = domain+file; // Modify this if you need to transform the file path into a URL
    return `<li id="style${index}" style="padding: 1em">
            <a href="${url}" target="_blank">${file}</a> - 
            <button onclick="navigator.clipboard.writeText('${url}')">Copy URL</button> - 
<!--            <a href="https://freemap.online" target="_blank">Share on Freemap</a>-->
            
            <details>
            <summary>
                        Style: ${humanInfo}
                        <div class="mydemo" style="background: ${defaultColor+"80"}; 
                        border: 3px solid;
                        border-color: ${defaultColor+"6E"}">
                        <span style="padding: 5px">Sample Style Rendering<span></div>
            </summary>
            
            <input type="color" name="fill" value="${defaultColor}">    
             <input type="range" name="opacity" value="0.5" min="0" max="1" step="0.02">
             
             <input type="range" name="radius" min="0" value="14" max="255" step="1">

             <br>
            <input type="color" name="strokeColor" value="${defaultColor}E6">
            
            <input type="range" name="strokeOpacity" value="0.9" min="0" max="1" step="0.004">

            <input type="range" name="stroke" min="0" value="3" max="1" step="0.02">
            <br>
            
            <input type="color" name="labelC" value="#00ff00">
            
            <input type="range" name="labelO" value="0" min="0" max="1" step="0.004">

            <input type="range" name="labelS" min="0" value="0" max="1" step="0.004">
            <br>
            
            <input type="text" name="label" placeholder="Enter label Property">
          
          
            <details>
            <summary>
                   Sample Feature Properties
            </summary>
            <pre>${JSON.stringify(f.properties, null, 2)}</pre>
            </details>
            <input type="text" name="urlayer">
            
            <button name="open"> View on FreeMap</button>
     
          </li>`;
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
<body>
    <h1>GeoJSON Files Index</h1>
    <p>Welcome to the FreeMap sample data, to use this side brows the natural earth data catalog whitch is all creative commons for the advancment of humanity.</p>
    <p>To use this site fist choose a layer. then desing a nice style for it. Finaly click the view in Freemap button to access the data directly.</p>
    <ul>
        `+linksHtml+`
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
                 
                let urlayer = el.querySelector("input[name='urlayer']") 
                let open = el.querySelector("input[name='open']") 
                let a = el.querySelector("a") 
            


                function co2rgba(c, o) {
                   return c +  Math.round(parseFloat(o) * 255).toString(16).padStart(2, '0');// 0 -> 00 1->FF
                }
                const encjs = data => encodeURIComponent(JSON.stringify(data));
                const decjs = enc => JSON.parse(decodeURIComponent(enc));
                
                        // let urlayer = "u="++ &f=#101010ff42&s=#111111ee02&l=#99ff990012$name";

                const getFill = ()=>{
                   return "f="+ co2rgba(co2rgba(fill.value, op.value), r.value)
                }
                const getStroke = ()=>{
                   return "s="+ co2rgba(co2rgba(strokeC.value, strokeO.value), stroke.value)
                }
                const getLabel = ()=>{
                   return "l="+ co2rgba(co2rgba(labelC.value, labelO.value), labelS.value) + "$" +label.value
                }


                let urlayerParam  = "u=" + a.href+"&f=" +  co2rgba(fill.value, op.value) + parseInt(r.value).toString(16).padStart(2, '0');
                urlayerParam += "&s=" +  co2rgba(strokeC.value, strokeO.value) + stroke
                
                urlayerParam += "&" + getLabel()
                
                console.log("urlayerParam: ", urlayerParam);
                
                let urlayers = [urlayerParam]
     
                // function qsa
                let shareUrl = "https://freemap.online/map42/?cfairport=1&urlayers=" + encjs(urlayers);
                
                
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
                  })
                
                labelS.addEventListener("input", e=>{
                    let s =  co2rgba("", labelS.value) + "px"      
                    demo.style.fontSize =   s
                    console.log(demo,s )      
                })
                console.log(shareUrl);
                
                fill.addEventListener("input", e=>{
                    demo.style.background = co2rgba(fill.value, op.value)
                    // demo.style.borderColor = fill.value
                    
                })
                
                op.addEventListener("input", e=>{
                   demo.style.background = co2rgba(fill.value, op.value)
                   
                })
                
                strokeO.addEventListener("input", e=>{
      
                   demo.style.borderColor = co2rgba(strokeC.value, strokeO.value)
               
                })
                
                strokeC.addEventListener("input", e=>{
                    // demo.style.background = fill.value;
                    
                    demo.style.borderColor = co2rgba(strokeC.value, strokeO.value)
                    
                })
                stroke.addEventListener("input", e=>{
                    demo.style.borderWidth = parseInt(stroke.value*24) + "px";
                })
                // demo.style.opacity = op
               
    
    })
    
    // is.forEach() 
    
    
   </script>
</body>
</html>
`;

fs.writeFileSync('index.html', htmlContent);

fs.writeFileSync('features.json', JSON.stringify(features));
