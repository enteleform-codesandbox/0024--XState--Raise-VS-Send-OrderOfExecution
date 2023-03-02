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
//##>  Setup                                                                                                        ##//
//####################################################################################################################//

	const use_ExplicitNavigation = false


//####################################################################################################################//
//##>  Exports.Namespace                                                                                            ##//
//####################################################################################################################//

	export namespace ModeMachine{

		export type Context = {
			_path: string[]
		}

		export type Event = (
			/* Actual Events: exist only for direct state transitions */
			| {type:"_EXIT"   }
			| {type:"_TO_ROOT"}
			| {type:"_TO_A"   }
			| {type:"_TO_B"   }
			| {type:"_TO_Y"   }
			| {type:"_TO_Z"   }

			/* Ensured Events: execute sequences of Actual Events as needed to navigate between arbitrary states */
			| {type:"TO_ROOT"}
			| {type:"TO_A"   }
			| {type:"TO_B"   }
			| {type:"TO_Y"   }
			| {type:"TO_Z"   }

			/* State Chart Of Actual Events:                                                                                            */
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

			preserveActionOrder: true,

			context: {
				_path: ["Root"],
			},

			on: {
				"*": {actions:"Log_InvalidEvent"},
			},

			states: {

				Root: {
					entry: Log_Entry({id, to:"Root"}),
					on: {
						_TO_A:   {target:"A", actions:[Push_Path("A"), Log_Transition({id, from:"Root", to:"A"})]},
						_TO_Y:   {target:"Y", actions:[Push_Path("Y"), Log_Transition({id, from:"Root", to:"Y"})]},
						TO_ROOT: {actions:["Log_ModePersisted"          ]},

						...((use_ExplicitNavigation) ? {
							TO_A: {actions:[Event("_TO_A"),               ]},
							TO_B: {actions:[Event("_TO_A"), Event("_TO_B")]},
							TO_Y: {actions:[Event("_TO_Y"),               ]},
							TO_Z: {actions:[Event("_TO_Y"), Event("_TO_Z")]},
						}:{
							TO_A: {actions:[Event("_TO_A"),              ]},
							TO_B: {actions:[Event("TO_A" ), Event("TO_B")]},
							TO_Y: {actions:[Event("_TO_Y"),              ]},
							TO_Z: {actions:[Event("TO_Y" ), Event("TO_Z")]},
						})
					},
				},

				A: {
					entry: Log_Entry({id, to:"A"}),
					on: {
						_EXIT:    {target:"Root", actions:["Pop_Path",     Log_Transition({id, from:"A", to:"Root"})]},
						_TO_B:    {target:"B",    actions:[Push_Path("B"), Log_Transition({id, from:"A", to:"B"   })]},
						_TO_ROOT: {actions:[Event("_EXIT"),                                                         ]},
						TO_A:     {actions:["Log_ModePersisted"                                                     ]},

						...((use_ExplicitNavigation) ? {
							TO_ROOT: {actions:[Event("_TO_ROOT"),                               ]},
							TO_B:    {actions:[Event("_TO_B"   ),                               ]},
							TO_Y:    {actions:[Event("_TO_ROOT"), Event("_TO_Y"),               ]},
							TO_Z:    {actions:[Event("_TO_ROOT"), Event("_TO_Y"), Event("_TO_Z")]},
						}:{
							TO_ROOT: {actions:[Event("_TO_ROOT"),              ]},
							TO_B:    {actions:[Event("_TO_B"   ),              ]},
							TO_Y:    {actions:[Event("TO_ROOT" ), Event("TO_Y")]},
							TO_Z:    {actions:[Event("TO_ROOT" ), Event("TO_Z")]},
						})
					},
				},

				B: {
					entry: Log_Entry({id, to:"B"}),
					on: {
						_EXIT:   {target:"A", actions:["Pop_Path", Log_Transition({id, from:"B", to:"A"})]},
						_TO_A:   {actions:[Event("_EXIT"),                                               ]},
						TO_B:    {actions:["Log_ModePersisted"                                           ]},

						...((use_ExplicitNavigation) ? {
							TO_ROOT: {actions:[Event("_TO_A"), Event("_TO_ROOT"),                               ]},
							TO_A:    {actions:[Event("_TO_A"),                                                  ]},
							TO_Y:    {actions:[Event("_TO_A"), Event("_TO_ROOT"), Event("_TO_Y"),               ]},
							TO_Z:    {actions:[Event("_TO_A"), Event("_TO_ROOT"), Event("_TO_Y"), Event("_TO_Z")]},
						}:{
							TO_ROOT: {actions:[Event("TO_A"   ), Event("TO_ROOT")]},
							TO_A:    {actions:[Event("_TO_A"  ),                 ]},
							TO_Y:    {actions:[Event("TO_ROOT"), Event("TO_Y"   )]},
							TO_Z:    {actions:[Event("TO_ROOT"), Event("TO_Z"   )]},
						})
					},
				},

				Y: {
					entry: Log_Entry({id, to:"Y"}),
					on: {
						_EXIT:    {target:"Root", actions:["Pop_Path",     Log_Transition({id, from:"Y", to:"Root"})]},
						_TO_Z:    {target:"Z",    actions:[Push_Path("Z"), Log_Transition({id, from:"Y", to:"Z"   })]},
						_TO_ROOT: {actions:[Event("_EXIT"),                                                         ]},
						TO_Y:     {actions:["Log_ModePersisted"                                                     ]},

						...((use_ExplicitNavigation) ? {
							TO_ROOT: {actions:[Event("_TO_ROOT"),                               ]},
							TO_A:    {actions:[Event("_TO_ROOT"), Event("_TO_A"),               ]},
							TO_B:    {actions:[Event("_TO_ROOT"), Event("_TO_A"), Event("_TO_B")]},
							TO_Z:    {actions:[Event("_TO_Z"   ),                               ]},
						}:{
							TO_ROOT: {actions:[Event("_TO_ROOT"),              ]},
							TO_A:    {actions:[Event("TO_ROOT" ), Event("TO_A")]},
							TO_B:    {actions:[Event("TO_A"    ), Event("TO_B")]},
							TO_Z:    {actions:[Event("_TO_Z"   ),              ]},
						})
					},
				},

				Z: {
					entry: Log_Entry({id, to:"Z"}),
					on: {
						_EXIT:   {target:"Y", actions:["Pop_Path", Log_Transition({id, from:"Z", to:"Y"})]},
						_TO_Y:   {actions:[Event("_EXIT"),                                               ]},
						TO_Z:    {actions:["Log_ModePersisted"                                           ]},

						...((use_ExplicitNavigation) ? {
							TO_ROOT: {actions:[Event("_TO_Y"), Event("_TO_ROOT"),                               ]},
							TO_A:    {actions:[Event("_TO_Y"), Event("_TO_ROOT"), Event("_TO_A"),               ]},
							TO_B:    {actions:[Event("_TO_Y"), Event("_TO_ROOT"), Event("_TO_A"), Event("_TO_B")]},
							TO_Y:    {actions:[Event("_TO_Y"),                                                  ]},
						}:{
							TO_ROOT: {actions:[Event("TO_Y"   ), Event("TO_ROOT")]},
							TO_A:    {actions:[Event("TO_ROOT"), Event("TO_A"   )]},
							TO_B:    {actions:[Event("TO_ROOT"), Event("TO_B"   )]},
							TO_Y:    {actions:[Event("_TO_Y"  ),                 ]},
						})
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
