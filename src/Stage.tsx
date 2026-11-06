import {ReactElement} from "react";
import {
    StageBase,
    StageResponse,
    InitialData,
    Message
} from "@chub-ai/stages-ts";
import {LoadResponse} from "@chub-ai/stages-ts/dist/types/load";


type InitStateType = {
    seed: number;
    floor: number;
    map: string[];
};

type MessageStateType = {
    playerX: number;
    playerY: number;
    turn: number;
};

type ChatStateType = null;

type ConfigType = any;


export class Stage extends StageBase<
    InitStateType,
    ChatStateType,
    MessageStateType,
    ConfigType
> {

    dungeon: InitStateType;
    gameState: MessageStateType;


    constructor(
        data: InitialData<
            InitStateType,
            ChatStateType,
            MessageStateType,
            ConfigType
        >
    ) {
        super(data);

        this.dungeon = data.initState ?? {
            seed: Math.floor(Date.now() % 100000000),
            floor: 1,

            map: [
                "888888888888888",
                "88OOOOO888OOOOO",
                "88OOOODO---OOOO",
                "88OOOOO8|8OOOOO",
                "88888888|888888",
                "888888OOOOO8888",
                "888888OOOOO8888",
                "888888888888888"
            ]
        };

        this.gameState = data.messageState ?? {
            playerX: 6,
            playerY: 2,
            turn: 0
        };
    }


    async load(): Promise<
        Partial<
            LoadResponse<
                InitStateType,
                ChatStateType,
                MessageStateType
            >
        >
    > {

        return {
            success: true,
            error: null,

            initState: this.dungeon,

            chatState: null
        };
    }


    async setState(
        state: MessageStateType
    ): Promise<void> {

        if (state != null) {
            this.gameState = {
                ...this.gameState,
                ...state
            };
        }
    }


    async beforePrompt(
        userMessage: Message
    ): Promise<
        Partial<
            StageResponse<
                ChatStateType,
                MessageStateType
            >
        >
    > {

        this.gameState.turn += 1;

        return {

            stageDirections: `
AUTHORITATIVE DUNGEON ENGINE STATE

Dungeon seed:
${this.dungeon.seed}

Floor:
${this.dungeon.floor}

Turn:
${this.gameState.turn}

Player coordinate:
X=${this.gameState.playerX}
Y=${this.gameState.playerY}

Dungeon map:
${this.getRawMap()}

IMPORTANT:

The map and coordinates above are authoritative.

Do not move, rotate, resize, reroll, or replace established dungeon geometry.

The Dungeon Master bot remains responsible for:
- narration,
- creatures,
- NPC behavior,
- environmental events,
- Story Choices,
- interpreting active Chub Lorebook entries.

The Stage controls persistent dungeon state.

Continue using the Character Card, Scenario, Lorebooks, and chat history normally.

Do not repeat this internal engine information verbatim to the player.
`.trim(),

            messageState: {
                ...this.gameState
            },

            modifiedMessage: null,

            systemMessage: null,

            error: null,

            chatState: null
        };
    }


    async afterResponse(
        botMessage: Message
    ): Promise<
        Partial<
            StageResponse<
                ChatStateType,
                MessageStateType
            >
        >
    > {

        return {

            stageDirections: null,

            messageState: {
                ...this.gameState
            },

            modifiedMessage: null,

            systemMessage: null,

            error: null,

            chatState: null
        };
    }


    getRawMap(): string {

        const map =
            this.dungeon.map.map(
                row => row.split("")
            );

        if (
            map[this.gameState.playerY] &&
            map[this.gameState.playerY][this.gameState.playerX]
        ) {

            map[this.gameState.playerY][
                this.gameState.playerX
            ] = "X";
        }

        return map
            .map(row => row.join(""))
            .join("\n");
    }


    getDisplayMap(): string {

        const symbols: {[key: string]: string} = {

            "8": "８",
            "O": "Ｏ",
            "X": "Ｘ",
            "D": "Ｄ",
            "-": "－",
            "|": "｜",
            "+": "＋",
            "S": "Ｓ",
            "#": "＃",
            "=": "＝"
        };

        return this
            .getRawMap()
            .split("\n")
            .map(
                row =>
                    row
                        .split("")
                        .map(
                            c => symbols[c] ?? c
                        )
                        .join("")
            )
            .join("\n");
    }


    render(): ReactElement {

        return (

            <div
                style={{
                    width: "100vw",
                    minHeight: "100vh",
                    background: "#101114",
                    color: "#eeeeee",
                    padding: "20px",
                    boxSizing: "border-box",
                    fontFamily: "Arial"
                }}
            >

                <h2>
                    Dungeon Engine
                </h2>

                <div>
                    Seed: {this.dungeon.seed}
                </div>

                <div>
                    Floor: {this.dungeon.floor}
                </div>

                <div>
                    Turn: {this.gameState.turn}
                </div>

                <div>
                    Position:
                    {" "}
                    {this.gameState.playerX},
                    {" "}
                    {this.gameState.playerY}
                </div>


                <pre
                    style={{
                        marginTop: "20px",
                        fontSize: "20px",
                        lineHeight: "1.05",
                        whiteSpace: "pre",
                        overflowX: "auto"
                    }}
                >
                    {this.getDisplayMap()}
                </pre>

            </div>
        );
    }
}