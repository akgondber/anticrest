import styled from "@emotion/styled";

type GamePanelProps = {
    isOver: boolean;
};

// background-color: ${(props: GamePanelProps) => props.isOver ? 'green' : 'grey'};

const StatusPanel = styled.div`
    height: 10%;
    display: flex;
    flex-direction: column;
    align-items: center;
    background-color: cyan;
`;

const GamePanel = styled.div`
    height: 80%;
    filter: ${(props: GamePanelProps) => props.isOver ? 'blur(5px)' : ''};
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    align-items: center;
`;

export default GamePanel;

export {
    StatusPanel,
};
