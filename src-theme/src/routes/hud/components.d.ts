/*
 * This file is part of LiquidBounce (https://github.com/CCBlueX/LiquidBounce)
 *
 * Copyright (c) 2015 - 2025 CCBlueX
 *
 * LiquidBounce is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * LiquidBounce is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with LiquidBounce. If not, see <https://www.gnu.org/licenses/>.
 */

import type {NotificationSeverity} from "../../integration/events";

declare global {
interface HudToggleableConfigurable {
    enabled: boolean;
}

interface HudArrayListSettings {
    showTags: boolean;
    lowercase: boolean;
    scale: number;
    itemAlignment: "Left" | "Right";
    order: "Ascending" | "Descending";
    theme: string;
    customPrimary: number;
    customSecondary: number;
    background: "Off" | "Solid" | "Translucent";
    backgroundAlpha: number;
    glow: "Off" | "Soft" | "Strong";
    shadow: boolean;
    animation: "Slide";
    animationSpeed: number;
    border: "None" | "Accent" | "Item";
}

interface HudInventoryStatisticsSettings {
    items: string[];
    showEmpty: boolean;
    rowLength: number;
}

interface HudBlockCounterSettings {
    iconPosition: "None" | "Left" | "Right" | "Top" | "Bottom";
}

interface HudScoreboardSettings {
    show: ("Header" | "Name" | "Score")[];
    replaceRegex: string;
    replaceWith: string;
}

interface HudNotificationsSettings {
    severities: NotificationSeverity[];
}

interface HudTextSettings {
    text: string;
    color: number;
    font: string;
    size: number;
    decorations: HudToggleableConfigurable & {
        bold: boolean;
        italic: boolean;
        underline: boolean;
        strikethrough: boolean;
    };
    shadow: HudToggleableConfigurable & {
        offsetX: number;
        offsetY: number;
        blurRadius: number;
        color: number;
    };
    glow: HudToggleableConfigurable & {
        radius: number;
        color: number;
    };
}

}

export {};
