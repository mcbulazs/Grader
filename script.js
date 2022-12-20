var isModalOpened = false
function calc() {
    document.getElementById("final").innerText = "0% (1)"
    var ossz=document.getElementById("osszpont").value*1
    var elert=document.getElementById("elert").value*1
    console.log(ossz+" "+elert);
    if (ossz=="") {
        alert("Az összpont mező üres")
        return
    }
    if (elert=="") {
        alert("Az elért mező üres")
        return
    }
    if (ossz<elert) {
        alert("Az összpont nem lehet kevesebb mint az elért pont")
        return
    }
    var szazalek=Math.round((elert/ossz)*1000)/10
    var one=document.getElementById("one").value
    var two=document.getElementById("two").value
    var three=document.getElementById("three").value
    var four=document.getElementById("four").value
    var grade
    if (szazalek<=one) {
        grade=1
    }else if (szazalek<=two){
        grade=2
    }else if (szazalek<=three){
        grade=3
    }else if (szazalek<=four){
        grade=4
    }else{
        grade=5
    }
    document.getElementById("final").innerText = szazalek+"% ("+grade+")"
}

function showModal() {
    isModalOpened = true
    document.getElementById("modal").style.visibility = "visible"
}

function closeModal() {
    isModalOpened = false
    document.getElementById("modal").style.visibility = "hidden"
}

function showInformation() {
    document.getElementById("info").style.visibility = "visible"
}
function closeInformation() {
    document.getElementById("info").style.visibility = "hidden"
}
document.addEventListener("keydown", function (event) {
    if (event.key==="Enter") {
        calc()
    }else if (event.key === " ") {
        showModal()
    }else if (event.key === "Escape"){
        closeModal()
        closeInformation()
    }else if (event.key === "Tab"){
        event.preventDefault()
        if (isModalOpened) {
            if (document.activeElement === document.getElementById("one")) {
                document.getElementById("two").focus()
            }
            else if (document.activeElement === document.getElementById("two")) {
                document.getElementById("three").focus()
            }
            else if (document.activeElement === document.getElementById("three")) {
                document.getElementById("four").focus()
            }
            else if (document.activeElement === document.getElementById("four")) {
                document.getElementById("one").focus()
            }
            else{
                document.getElementById("one").focus()
            }
        }else{

            if (document.activeElement !== document.getElementById("osszpont")) {
                document.getElementById("osszpont").focus()
            }else{
                document.getElementById("elert").focus()
            }
        }
    }else if(event.key === "i"){
        showInformation()
    }
})