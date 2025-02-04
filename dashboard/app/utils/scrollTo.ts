export function scrollToElement(id: string, behavior: ScrollBehavior = "smooth", block: ScrollLogicalPosition = "nearest") {
    const element = document.getElementById(id);
    if (element) {
        element.scrollIntoView({
            block,
            behavior,
        });
    }
}
