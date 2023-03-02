//###  NPM  ###//
import {debounce} from "lodash-es"
import {
	assign,
	createMachine,
	SendAction,
	RaiseAction,
} from "xstate"


//####################################################################################################################//
//##>  Aliases                                                                                                      ##//
//####################################################################################################################//

	type Context   = ModeMachine.Context
	type Event     = ModeMachine.Event
	type EventName = ModeMachine.EventName


//####################################################################################################################//
//##>  Exports.Namespace                                                                                            ##//
//####################################################################################################################//

	export namespace ModeMachine{

		export type Context = {
			_path: string[]
		}

		export type Event = (
			| {type:"_EXIT"   }
			| {type:"_TO_ROOT"}
			| {type:"_TO_A"   }
			| {type:"_TO_B"   }
			| {type:"_TO_Y"   }
			| {type:"_TO_Z"   }

			/* State Chart Of Events:                                                                                                   */
			/*   https://stately.ai/registry/editor/36691f99-f69c-4de7-84a5-5fa13f2b405d?machineId=c6461eab-322b-42bb-a195-738ff817fea2 */
		)

		export type EventName = Event["type"]

	}


//####################################################################################################################//
//##>  Exports.MachineFactory                                                                                       ##//
//####################################################################################################################//

	export type     ModeMachine = ReturnType<typeof ModeMachine>
	export function ModeMachine(
		{Event,               id       }:
		{Event:EventFunction, id:string}
	){
		return createMachine<Context, Event>({

			id:      `ModeMachine.${id}`,
			initial: "Root",

			predictableActionArguments: false,
			preserveActionOrder:        true,

			context: {
				_path: ["Root"],
			},

			states: {

				Root: {
					entry: Log_Entry({id, to:"Root"}),
					on: {
						_TO_A: {target:"A", actions:[Push_Path("A"), Log_Transition({id, from:"Root", to:"A"})]},
						_TO_Y: {target:"Y", actions:[Push_Path("Y"), Log_Transition({id, from:"Root", to:"Y"})]},
					},
				},

				A: {
					entry: Log_Entry({id, to:"A"}),
					on: {
						_TO_ROOT: {target:"Root", actions:["Pop_Path",     Log_Transition({id, from:"A", to:"Root"})]},
						_TO_B:    {target:"B",    actions:[Push_Path("B"), Log_Transition({id, from:"A", to:"B"   })]},
					},
				},

				B: {
					entry: Log_Entry({id, to:"B"}),
					on: {
						_TO_A: {target:"A", actions:["Pop_Path", Log_Transition({id, from:"B", to:"A"})]},
					},
				},

				Y: {
					entry: Log_Entry({id, to:"Y"}),
					on: {
						_TO_ROOT: {target:"Root", actions:["Pop_Path",     Log_Transition({id, from:"Y", to:"Root"})]},
						_TO_Z:    {target:"Z",    actions:[Push_Path("Z"), Log_Transition({id, from:"Y", to:"Z"   })]},
					},
				},

				Z: {
					entry: Log_Entry({id, to:"Z"}),
					on: {
						_TO_Y: {target:"Y", actions:["Pop_Path", Log_Transition({id, from:"Z", to:"Y"})]},
					},
				},

			},

		}).withConfig({

			actions: {
				Pop_Path: assign(({_path}) => ({_path:_path.slice(0, (_path.length - 1))})),

				Log_InvalidEvent ({_path}, {type}, {state:{value}}){console.log(JSON.stringify({id, "@":"!!! INVALID_EVENT !!!", event:type, state:value, _path}))},
				Log_ModePersisted({_path}, {type}, {state:{value}}){console.log(JSON.stringify({id, "@":"MODE_PERSISTED",        event:type, state:value, _path}))},
			},

		})
	}


//####################################################################################################################//
//##>  Types                                                                                                        ##//
//####################################################################################################################//

	type EventFunction =
		| ((event:EventName) => SendAction <Context, Event, any>)
		| ((event:EventName) => RaiseAction<Context, Event, any>)


//####################################################################################################################//
//##>  Utilities                                                                                                    ##//
//####################################################################################################################//

	function Push_Path(to:string)
		{return assign(({_path}:Context) => ({_path:[..._path, to]}))}

	function Log_Entry(
		{id,        to       }:
		{id:string, to:string}
	){
		return (({_path}:Context, {type}:Event, {state:{value}}:any) => {
			console.log(JSON.stringify({id, "@":"ENTRY", to, event:type, state:value, _path}))
			log_Delimiter()
		})
	}

	function Log_Transition(
		{id,        from,        to       }:
		{id:string, from:string, to:string}
	){
		return (({_path}:Context, {type}:Event, {state:{value}}:any) => {
			console.log(JSON.stringify({id, "@":"TRANSITION", from, to, event:type, state:value, _path}))
		})
	}

	const log_Delimiter = debounce(() => {
		console.log("-".repeat(90))
	}, 100)
