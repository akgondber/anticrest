import styled from "@emotion/styled";

type GamePanelProps = {
    isOver: boolean;
};

const GamePanel = styled.div`
    height: 100%;
    background-color: ${(props: GamePanelProps) => props.isOver ? 'green' : 'grey'};
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    align-items: center;
`;

export default GamePanel;
