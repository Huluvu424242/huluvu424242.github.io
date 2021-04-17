import {FunctionalComponent, h} from '@stencil/core';
import {Disclaimer} from "./Disclaimer";


interface HeaderProps {
  // hier könnten properties für Parameterübergaben rein
  // title: string;
}

export const Header: FunctionalComponent<HeaderProps> = () => ([
  <honey-news-navbar/>,
  <Disclaimer/>
]);

