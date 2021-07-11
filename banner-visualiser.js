let dataObj = {
  tl_width: 100,
  tlrow_height: 16
}
localStorage.getItem("BannerTool_DataObj") === null ? null : dataObj = JSON.parse(localStorage.getItem("BannerTool_DataObj"));

function addTlContainer() {
  document.body.innerHTML += `
<div id="tl" style="width:${dataObj.tl_width === 100 ? "" : dataObj.tl_width}%;" data-rowheight="${dataObj.tlrow_height}">
</div>
<div id="tl_info">
<div class="var_scalerotate">Scale / Rotate</div>
<div class="var_xy">X / Y</div>
<div class="var_opacity">Opacity</div>
<div class="var_hw">Height / Width</div>
<div class="var_function">Function</div>
</div>
<div id="tl_range">
<div>
  <span>Width</span>
  <input type="range" min="10" max="100" value="${dataObj.tl_width}" step="10" class="slider_width" oninput="tl_intervalHandler(this)">
  <span>${dataObj.tl_width}%</span>
</div>
<div>
  <span>Row height</span>
  <input type="range" min="12" max="28" value="${dataObj.tlrow_height}" step="4" class="slider_height" oninput="tl_intervalHandler(this)">
  <span>${dataObj.tlrow_height}px</span>
</div>
</div>`
}

addTlContainer()

function addTimelineViz(tl_parm) {

  console.log(tl_parm)

  // Variables
  const tl_viz = document.querySelector("#tl");
  let tl_dur = tl_parm._dur;

  // Check if animation extends duration
  for (let i = 0; i < tl_parm.getChildren().length; i++) {
    let selectedSlot = tl_parm.getChildren()[i];

    if (selectedSlot._targets !== undefined) {
      if (typeof selectedSlot._targets[0] === 'function' && (selectedSlot._start + selectedSlot._targets[0]()._dur) > tl_dur) {
        tl_dur = selectedSlot._start + selectedSlot._targets[0]()._dur;
      }
    }
  }

  tl_viz.setAttribute("data-sec", tl_dur);

  // Reset / Remove children
  tl_viz.innerHTML = "";


  // Insert secondlines
  let newSecondLinewrapper = document.createElement("div");
  newSecondLinewrapper.classList.add("tl_secondlinewrapper")
  let newSecondNumberwrapper = document.createElement("div");
  newSecondNumberwrapper.classList.add("tl_secondnumberwrapper")

  for (let i = 0; i <= tl_dur; i++) {

    // 10th of a second lines
    for (let j = 0; j < 10; j++) {
      let newSecondline = document.createElement("div");
      newSecondline.classList.add("tl_secondline")

      let tenths = ((100 / tl_dur) * j) / 10;
      let tenths_full = tenths + ((100 / tl_dur) * i);
      let leftValue = tenths_full;

      if (leftValue <= 100) {
        newSecondline.style.left = leftValue + "%";
        newSecondLinewrapper.appendChild(newSecondline);
      }

    }

    // full second lines
    // let newSecondline = document.createElement("div");
    // newSecondline.classList.add("tl_secondline")
    // newSecondline.style.left = leftValue + "%";
    // newSecondLinewrapper.appendChild(newSecondline);

    leftValue = (100 / tl_dur) * i;
    // numbers
    let newSecondNumber = document.createElement("div");
    newSecondNumber.classList.add("tl_secondnumber")
    newSecondNumber.style.left = leftValue + "%";
    newSecondNumber.innerHTML = i;

    newSecondNumberwrapper.appendChild(newSecondNumber);


  }
  tl_viz.appendChild(newSecondLinewrapper);
  tl_viz.appendChild(newSecondNumberwrapper);

  // Loop through all slots

  for (let i = 0; i < tl_parm.getChildren().length; i++) {

    let selectedSlot = tl_parm.getChildren()[i];
    if (selectedSlot._targets !== undefined) {

      // Add row and slot
      let newRow = document.createElement("div");
      let newSlot = document.createElement("div");


      if (typeof selectedSlot._targets[0] === 'object') {
        // standard

        // Set name
        let nameList = "";
        for (let j = 0; j < selectedSlot._targets.length; j++) {
          nameList += selectedSlot._targets[j].classList[0];

          if (j + 1 !== selectedSlot._targets.length) {
            nameList += " + ";
          }
        }
        newSlot.innerHTML = nameList;

        // Set width
        newSlot.style.width = (selectedSlot._tDur / tl_dur) * 100 + "%";

        newRow.setAttribute("dur", selectedSlot._dur);

      } else if (typeof selectedSlot._targets[0] === 'function') {
        // stupid

        // Set name
        newSlot.innerHTML = selectedSlot._targets[0].name;
        // newSlot.innerHTML = "Function";
        newSlot.style.backgroundColor = "#000";
        // Set width
        newSlot.style.width = (selectedSlot._targets[0]()._dur / tl_dur) * 100 + "%";


        newRow.setAttribute("dur", selectedSlot._targets[0]()._dur);

      }

      newRow.setAttribute("start", selectedSlot._start);

      // Set placement 
      let loopStartTime = tl_parm.getChildren()[0].parent._start
      let slotStartTime = selectedSlot._start;
      let parentTime = (selectedSlot.parent._start === loopStartTime ? 0 : selectedSlot.parent._start);
      newSlot.style.left = ((slotStartTime + parentTime) / tl_dur) * 100 + "%";



      // Style 
      newRow.classList.add("tl_row");
      newSlot.classList.add("tl_slot");

      const colorObj = {
        "scale": "#5252e0",
        "x": "#e05252",
        "y": "#e05252",
        "opacity": "#22c322",
        "height": "#ad1fad",
        "width": "#ad1fad",
        "rotate": "#5252e0",
      }

      let selectedColors = [];

      for (let j = 0; j < Object.keys(colorObj).length; j++) {
        if (selectedSlot.vars[Object.keys(colorObj)[j]] !== undefined && !selectedColors.includes(colorObj[Object.keys(colorObj)[j]])) {
          selectedColors.push(colorObj[Object.keys(colorObj)[j]])
        }
      }
      let bgGradient = "";
      let bgSize = "";
      for (let j = 0; j < selectedColors.length; j++) {
        bgGradient += `linear-gradient(${selectedColors[j]},${selectedColors[j]})`;
        bgSize += `${(j + 1) * (100 / selectedColors.length)}% 100%`;

        if (j + 1 !== selectedColors.length) {
          bgGradient += ", ";
          bgSize += ", ";
        }
      }
      newSlot.style.backgroundImage = bgGradient;
      newSlot.style.backgroundSize = bgSize;
      newSlot.style.backgroundRepeat = "no-repeat";


      // Append to DOM
      newRow.appendChild(newSlot);
      tl_viz.appendChild(newRow);

    }
  }
  // Add and animate timespot
  let newTimespot = document.createElement("div");
  newTimespot.classList.add("tl_timespot");
  newTimespot.style.transition = `left ${tl_dur / tl_parm._ts}s linear`;
  tl_viz.appendChild(newTimespot);
  setTimeout(() => {
    document.querySelector("#tl .tl_timespot").style.left = `100%`;
  }, 100);

  // Add extra features
  extraFeatures()
}

function tl_intervalHandler(parm) {

  console.log("PARM", parm)

  const tl_viz = document.querySelector("#tl");

  if (parm.classList.contains("slider_width")) {

    tl_viz.style.width = Number(parm.value) === 100 ? "" : parm.value + "%";
    parm.parentNode.children[2].innerHTML = parm.value + "%";

    dataObj.tl_width = Number(parm.value);

  } else if (parm.classList.contains("slider_height")) {

    tl_viz.setAttribute("data-rowheight", parm.value)

    parm.parentNode.children[2].innerHTML = parm.value + "px";

    dataObj.tlrow_height = Number(parm.value);
  }

  console.log("data", dataObj)
  localStorage.setItem("BannerTool_DataObj", JSON.stringify(dataObj));

}

// EXTRA FEATURES
function extraFeatures() {
  const banner = document.querySelector("#banner")
  const timeline = document.querySelector("#tl");

  // center banner and timeline
  banner.style.margin = "0 auto";
  timeline.style.margin = "20px auto";
}