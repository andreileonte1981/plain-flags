export default function scrollToFlag(flagId: string, behavior: ScrollBehavior = "smooth") {
    const id = flagId;
    const element = document.getElementById(id);
    if (element) {
        element.scrollIntoView({
            block: "nearest",
            behavior,
        });
    }
}
