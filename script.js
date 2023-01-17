var isModalOpened = false
var one
var two
var three
var four
var ossz
var elert
function calc() {
console.log("asd");
    document.getElementById("final").innerText = "0% (1)"
    ossz=document.getElementById("osszpont").value*1
    elert=document.getElementById("elert").value*1
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
    if (event.key==="Enter" && !isModalOpened) {
        calc()
        document.getElementById("elert").select()
    }else if (event.key === " ") {
        showModal()
    }else if (event.key === "Escape"){
        closeModal()
        closeInformation()
    }else if (event.key === "Tab" || (isModalOpened && event.key==="Enter")){
        event.preventDefault()
        if (isModalOpened) {
            if (document.activeElement === document.getElementById("one")) {
                document.getElementById("two").focus()
                document.getElementById("two").select()
            }
            else if (document.activeElement === document.getElementById("two")) {
                document.getElementById("three").focus()
                document.getElementById("three").select()
            }
            else if (document.activeElement === document.getElementById("three")) {
                document.getElementById("four").focus()
                document.getElementById("four").select()
            }
            else if (document.activeElement === document.getElementById("four")) {
                document.getElementById("one").focus()
                document.getElementById("one").select()
            }
            else{
                document.getElementById("one").focus()
                document.getElementById("one").select()
            }
        }else{

            if (document.activeElement !== document.getElementById("osszpont")) {
                document.getElementById("osszpont").focus()
                document.getElementById("osszpont").select()
            }else{
                document.getElementById("elert").focus()
                document.getElementById("elert").select()
            }
        }
    }else if(event.key === "i"){
        showInformation()
    }
})

function borderChange() {
    document.getElementById("twoUnder").innerText = document.getElementById("one").value + ".1 - "
    document.getElementById("threeUnder").innerText = document.getElementById("two").value + ".1 - "
    document.getElementById("fourUnder").innerText = document.getElementById("three").value + ".1 - "

    one=document.getElementById("one").value
    two=document.getElementById("two").value
    three=document.getElementById("three").value
    four=document.getElementById("four").value
    if (ossz!="" && elert!=""  && ossz>=elert) {
        calc()
    }
}