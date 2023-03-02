//###  App  ###//
import {ModeMachine           } from "./ModeMachine.js"
import {useMachine, UseMachine} from "Utilities/XState-Solid/index.js"

//###  NPM  ###//
import {Button, HopeProvider} from "@hope-ui/solid"
import {inspect             } from "@xstate/inspect"
import {For                 } from "solid-js"
import {send, raise         } from "xstate"


//####################################################################################################################//
//##>  Setup                                                                                                        ##//
//####################################################################################################################//

	const modes = [
		"Root",
		"A",
		"B",
		"Y",
		"Z",
	]


//####################################################################################################################//
//##>  Exports                                                                                                      ##//
//####################################################################################################################//

	export function App(){
		inspect({iframe:false})

		const Send  = useMachine(ModeMachine({Event:send,  id:"Send" }), {devTools:true})
		const Raise = useMachine(ModeMachine({Event:raise, id:"Raise"}), {devTools:true})

		return (
			<HopeProvider
				config         = {{initialColorMode:"dark"}}
				enableCssReset = {false                    }
			>
				<main>
					{MachineControls({actor:Send,  eventMode:"Send" })}
					{MachineControls({actor:Raise, eventMode:"Raise"})}
				</main>
			</HopeProvider>
		)
	}


//####################################################################################################################//
//##>  Components                                                                                                   ##//
//####################################################################################################################//

	function MachineControls(
		{actor,                         eventMode       }:
		{actor:UseMachine<ModeMachine>, eventMode:string}
	){
		const {state} = actor

		function send(event:ModeMachine.EventName){
			actor.send(event)
			console.log(JSON.stringify({id:eventMode, "@":"FINISHED", state:state.value}))
		}

		return (
			<div class="MachineControls">

				<div class="Row">
					<h2>{`${eventMode}.ActualEvents`}</h2>
					<For each={modes}>{(mode) => (
						<Button
							colorScheme = {(state.context._path.at(-2) == mode) ? "accent" : "primary"}
							disabled    = {!state.nextEvents.includes(ActualEvent(mode))              }
							onClick     = {() => {send(ActualEvent(mode))}                            }
						>
							{ActualEvent(mode)}
						</Button>
					)}</For>
				</div>

			</div>
		)
	}


//####################################################################################################################//
//##>  Utilities                                                                                                    ##//
//####################################################################################################################//

	function ActualEvent (mode:string){return (`_TO_${mode.toUpperCase()}` as ModeMachine.EventName)}
	function EnsuredEvent(mode:string){return (`TO_${mode.toUpperCase()}`  as ModeMachine.EventName)}
