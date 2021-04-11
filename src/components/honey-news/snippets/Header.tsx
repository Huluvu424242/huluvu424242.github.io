import {FunctionalComponent, h} from '@stencil/core';
import {Disclaimer} from "./Disclaimer";
import {Navbar} from "./Navbar";


interface HeaderProps {
  // hier könnten properties für Parameterübergaben rein
  // title: string;
}

export const Header: FunctionalComponent<HeaderProps> = () => ([
  <Navbar/>,
  <Disclaimer/>
]);

