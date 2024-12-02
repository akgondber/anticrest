import styled from "@emotion/styled";

const Combos = styled.div`
    display: block;
    height: 80%;
    max-height: 400px;
    width: 90px;
    background-color: cyan;
    color: grey;
    overflow-y: scroll;
`;

const Conta = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
`;

const ContaItem = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
`;

const Movement = styled.a`
    display: block;
    text-decoration: none;
    color: red;
`;

export {
    Combos,
    Conta,
    ContaItem,
    Movement,
};
