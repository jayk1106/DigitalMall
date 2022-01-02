
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
