export default function scrollToFlag(flagId: string) {
    const id = `flagcard_${flagId}`;
    const element = document.getElementById(id);
    if (element) {
        element.scrollIntoView({
            block: "nearest",
            behavior: "smooth",
        });
    }
}
