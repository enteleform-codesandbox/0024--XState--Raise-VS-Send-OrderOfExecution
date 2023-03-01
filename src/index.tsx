/* @refresh reload */

//###  CSS  ###//
import "Styles/Normalize.css"
import "Styles/Colors.scss"
import "Styles/Fonts.scss"
import "Styles/HopeUI.scss"
import "Styles/App.scss"

//###  App  ###//
import {App} from "./App"

//###  NPM  ###//
import {render} from "solid-js/web"


//####################################################################################################################//
//##>  Initialize                                                                                                   ##//
//####################################################################################################################//

	const $App = document.getElementById("App")!

	render(App, $App)
