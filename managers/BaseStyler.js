

const coolBlack = "#242727"
class BaseStyler { 
    constructor() { 
        this.theme = "light";
    }

    setAppearance(theme) { 
        this.theme = theme;
    }

    flipTheme() { 
        if (this.isDarkTheme()) { 
            this.setAppearance("light");
        } else {
            this.setAppearance("dark");
        }
    }

    getTheme() { 
        return this.theme;
    }

    isDarkTheme() { 
        return this.theme === "dark";
    }

    isLightTheme() { 
        return this.theme === "light";
    }

    choose(lightColor, darkColor) { 
        if (this.isDarkTheme()) { 
            return darkColor
        } else { 
            return lightColor
        }
    }

    getBackgroundColor() { 
        if (this.isDarkTheme()) { 
            return "#121212"
            // return "#222323";
        } else { 
            return "white";
        }
    }

    getOutlineColor() { 
        if (this.isDarkTheme()) { 
            return "white"
        } else { 
            return "#121212"
        }
    }

    getPrimaryColor() { 
        return "#00fff0"
    }
}

const StylerInstance = new BaseStyler();
export default StylerInstance;