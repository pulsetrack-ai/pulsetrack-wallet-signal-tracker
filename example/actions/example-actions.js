// Handlers for example actions
export function handleButtonClick(event) {
    const buttonText = event.target.innerText;
    console.log(`Button clicked: ${buttonText}`);
    alert(`Button '${buttonText}' was clicked!`);
}

export function handleFormSubmit(form) {
    event.preventDefault();
    const formData = new FormData(form);
    for (const [key, value] of formData.entries()) {
        console.log(`Form field ${key}: ${value}`);
    }
    alert('Form submitted!');
}

export function handleMouseOver(event) {
    event.target.style.backgroundColor = '#e0e0e0';
    console.log(`Mouse over: ${event.target.tagName}`);
}

export function handleMouseOut(event) {
    event.target.style.backgroundColor = '';
    console.log(`Mouse out: ${event.target.tagName}`);
}

export function handleWindowResize() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    console.log(`Window resized to ${width}x${height}`);
}
