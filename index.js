let messageinput=document.querySelector('textarea');
let chatbody=document.querySelector('.chat-body');
let sendmessagebutton=document.querySelector('#send-message');
let messagelement=document.querySelector('.message-text');
let fileinput=document.querySelector('#file-input');
let fileuploadwrapper=document.querySelector('.file-upload-wrapper');
let filecancelbutton=document.querySelector('#file-cancel')
let chatbottoggler=document.querySelector('#chatbot-toggler');
let closechatbot=document.querySelector("#close-chatbot");
const api_key="AIzaSyAnFDb5dpbHJmQwkDmNF0szeVGJUBA9aT0"
const api_url=`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${api_key}`

const userdata={
    message:null,
    file:{
        data:null,
        mime_type:null
    }
}
const chathistory=[];
const initialinputheight=messageinput.scrollHeight;
const generatebotresponse=async (incomingmessagediv)=>{
    const messagelement=incomingmessagediv.querySelector(".message-text");
    chathistory.push({
        role:"user",
        parts:[{text:userdata.message},...(userdata.file.data?[{inline_data:userdata.file}]:[])]
    })
    const requestoption={
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
            contents:[{
                parts:[{text:userdata.message},...(userdata.file.data?[{inline_data:userdata.file}]:[])]
            }]
        })
    }
    try {
        const response = await fetch(api_url, requestoption);
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error.message || 'Something went wrong');
        }
       const reply=data.candidates[0].content.parts[0].text.replace(/\*\*(.*?)\*\*/g,"$1").trim();
       chathistory.push({
        role:"bot",
        parts:[{text:reply}]
    })
       messagelement.innerText=reply;
    } catch (error) {
        console.log("Error:", error);
        messagelement.innerText=error.message;
       messagelement.style.color="#ff0000"
    }finally{
        userdata.file={};
        incomingmessagediv.classList.remove("thinking");
        chatbody.scrollTo({top:chatbody.scrollHeight,behavior:"smooth"})
    }
    
}
const createmessageelementuser=(content)=>{
    const div=document.createElement('div');
    div.classList.add("user-message");
    div.innerHTML=content;
    return div;
}
const createmessageelementbot=(content)=>{
const div=document.createElement('div');
div.classList.add("bot-message");
div.innerHTML=content;
return div;
}

//handle outgoing user message
const handleoutgoingmessage=()=>{
    const messagecontent=`<div class="message-text">
    ${messageinput.value.trim()}
    </div>${userdata.file.data?`<img src="data:${userdata.file.mime_type};base64,${userdata.file.data}" class="attachment"/>`:""}`;
    fileuploadwrapper.classList.remove("file-uploaded");
    const outgoingmessagediv=createmessageelementuser(messagecontent);
    chatbody.appendChild(outgoingmessagediv);
    chatbody.scrollTo({top:chatbody.scrollHeight,behavior:"smooth"})
    messageinput.dispatchEvent(new Event("input"));

    setTimeout(()=>{
        const messagecontent=`<div class="message bot-message thinking">
                <span class="material-symbols-outlined smart_toy">smart_toy</span>
                <div class="message-text">
                    <div class="thinking-indicator">
                        <div class="dot"></div>
                        <div class="dot"></div>
                        <div class="dot"></div>
                    </div>
                </div>
            </div>`
                 const incomingmessagediv=createmessageelementbot(messagecontent);
                    chatbody.appendChild(incomingmessagediv);
                    chatbody.scrollTo({top:chatbody.scrollHeight,behavior:"smooth"})
                        generatebotresponse(incomingmessagediv);              
                     
                       
                                 
    },700)
}   
//handle enter key press for sending message
messageinput.addEventListener('keydown',(e)=>{
    userdata.message=messageinput.value.trim();
    const usermessage=e.target.value.trim();
    if(e.key=='Enter' && usermessage && !e.shiftKey && window.innerWidth>768){
      handleoutgoingmessage(usermessage);
      e.preventDefault();
      messageinput.value="";
    }
})
sendmessagebutton.addEventListener("click",(e)=>{
    userdata.message=messageinput.value.trim();
    const usermessage=messageinput.value.trim();
    if(usermessage){
      handleoutgoingmessage(usermessage);
      e.preventDefault();
      messageinput.value="";
    }
})

document.querySelector("#file-upload").addEventListener("click",(e)=>{
     e.preventDefault();
    fileinput.click();
})
fileinput.addEventListener("change",(e)=>{
const file=fileinput.files[0];
console.log(file); 
if(!file){
    return;
}
const reader=new FileReader();
reader.onload =(e)=>{
    fileuploadwrapper.querySelector("img").src=e.target.result;
    fileuploadwrapper.classList.add("file-uploaded")
    const base64string=e.target.result.split(",")[1];
   userdata.file={
    data:base64string,
    mime_type:file.type
   }
   fileinput.value="";
console.log(base64string);
}
reader.readAsDataURL(file);
})
// filecancelbutton.addEventListener("click",()=>{
//     userdata.file={},
//     fileuploadwrapper.classList.remove("file-uploaded");
// })

const picker = new EmojiMart.Picker({
    theme:"light",
    skinTonePosition:"none",
    previewPosition:"none",
    onEmojiSelect:(emoji)=>{
        const { selectionStart:start,selectionEnd:end}=messageinput;

        messageinput.setRangeText(emoji.native,start,end,"end");
        messageinput.focus();
    },
    onClickOutside:(e)=>{
        if(e.target.id==="emoji-picker"){
            e.preventDefault();
            document.body.classList.toggle("show-picker");
        }else{
            document.body.classList.remove("show-picker");
        }
    }
});
document.querySelector('.chat-form').appendChild(picker);

chatbottoggler.addEventListener("click",(e)=>{
    e.preventDefault();
    document.body.classList.toggle("show-chatbot");
})

closechatbot.addEventListener("click",()=>{
    document.body.classList.remove("show-chatbot");
})

messageinput.addEventListener("input",()=>{
    messageinput.style.height=`${initialinputheight}px`
     messageinput.style.height=`${messageinput.scrollHeight}px`
     document.querySelector(".chat-form").style.borderRadius =messageinput.scrollHeight>initialinputheight?"15px":"32px"
})