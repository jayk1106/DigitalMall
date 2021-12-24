// Drag and drop
function dragNdrop(event) {
  var fileName = URL.createObjectURL(event.target.files[0]);
  var preview = document.getElementById("preview");
  var previewImg = document.createElement("img");
  previewImg.setAttribute("src", fileName);
  preview.innerHTML = "";
  preview.appendChild(previewImg);
}
function drag() {
  document.getElementById('uploadFile').parentNode.className = 'draging dragBox';
}
function drop() {
  document.getElementById('uploadFile').parentNode.className = 'dragBox';
}

// Add Specification
var addSpCouter = 2;
function addSpecs(){
  if( addSpCouter <= 5 ){
    const sl = document.getElementById('speslist');
    const sItem = `<div class="spasItem"><input type="text" placeholder="Specifications" name="specItem${addSpCouter}"></div>`;
    sl.insertAdjacentHTML('beforeend',sItem);
    addSpCouter++;
  }
}
