document.addEventListener("DOMContentLoaded", async () => {
    try {
        await navigator.mediaDevices.getUserMedia({audio: true});
    } catch (e: any) {}
    window.close();
})

export {};
