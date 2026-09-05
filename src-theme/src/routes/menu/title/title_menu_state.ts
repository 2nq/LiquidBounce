export type TitleMenuState = "regular" | "client";
export type TitleMenuAction = "open-client" | "back";

export function nextTitleMenuState(_: TitleMenuState, action: TitleMenuAction): TitleMenuState {
    return action === "open-client" ? "client" : "regular";
}
