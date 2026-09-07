type KeyLike = Pick<KeyboardEvent, "key" | "ctrlKey" | "altKey" | "metaKey">;
type EditableLike = {tagName?: string; isContentEditable?: boolean};
type ScrollContainer = {scrollTop: number};

export function shouldStartSearch(event: KeyLike, target: EditableLike | null): boolean {
    const tagName = target?.tagName?.toUpperCase();
    const editable = target?.isContentEditable || tagName === "INPUT" || tagName === "TEXTAREA" || tagName === "SELECT";

    return event.key.length === 1 && !event.ctrlKey && !event.altKey && !event.metaKey && !editable;
}

export function createScrollMemory() {
    let saved = 0;

    return {
        capture(container: ScrollContainer | null) {
            if (container) saved = container.scrollTop;
        },
        restore(container: ScrollContainer | null) {
            if (container) container.scrollTop = saved;
        },
    };
}
