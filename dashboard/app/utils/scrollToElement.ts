export default function scrollToElement(id: string, behavior: ScrollBehavior = "smooth") {
    const element = document.getElementById(id);
    if (element) {
        element.scrollIntoView({
            block: "nearest",
            behavior,
        });
    }
}
