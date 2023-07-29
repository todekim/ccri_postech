document.addEventListener("DOMContentLoaded", function(){
// Handler when the DOM is fully loaded
    console.log("hello")
});

function numberMaxLength(e){
  
    if(e.value.length > e.maxLength){

        e.value = e.value.slice(0, e.maxLength);

    }

}

$("#su").on("click", function(){

    var email = $("#email").val()
    var regex = /^([0-9a-zA-Z_\.-]+)@([0-9a-zA-Z_-]+)(\.[0-9a-zA-Z_-]+){1,2}$/i

    if($("#check").is(":checked") == false ){
        alert("개인정보 수집 및 이용에 동의해 주세요.")
    }else if($("#txt").val().length < 2){
        alert("이름을 정확히 입력해 주세요.")
    }else if($("#message").val().length < 1) {
        alert("메세지를 입력해 주세요.")
    }else if(!regex.test(email)){
        alert("잘못된 이메일 형식입니다.")
    }
    else{
        $("#sendData").submit();
       
    }

    // if($("#check").is(":checked") == false ){
    //     alert("개인정보 수집 및 이용에 동의해 주세요.")
    // }else if($("#txt").val().length < 2){
    //     alert("이름을 정확히 입력해 주세요.")
    // }else if($(".ph_num").val().length < 1) {
    //     alert("연락처를 입력해 주세요.")
    // }else if($("#message").val().length < 1) {
    //     alert("메세지를 입력해 주세요.")
    // }else{
    //     $("#sendData").submit();
       
    // }
})