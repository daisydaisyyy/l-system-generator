export const REGEX = /[\[\]\+\-\=;\()\\]/;

export function getRandColor(colorToAvoid = "#ffffff") {
  let color = colorToAvoid;
  while (color === colorToAvoid)
    color = '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
  return color;
}

export function showMsg(msgText, success = false) {
  let message = document.createElement("div");
    message.classList.add("statusMsg");
    message.classList.add(success ? "successMsg" : "failMsg");
    let msgContent = document.createElement("p");
    msgContent.textContent = msgText;
    message.appendChild(msgContent);
    document.body.appendChild(message);
    setTimeout(() => {
      document.body.removeChild(message);
    }, 2000);
}