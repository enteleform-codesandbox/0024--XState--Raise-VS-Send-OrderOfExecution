//###  NPM  ###//
import type {AnyStateMachine, InterpreterFrom, Prop, StateFrom} from "xstate"
import type {CheckSnapshot,   RestParams                      } from "@xstate/solid/lib/types"
import {useMachine as _useMachine}                              from "@xstate/solid"


//####################################################################################################################//
//##>  Exports                                                                                                      ##//
//####################################################################################################################//

	export function useMachine<
		Machine extends AnyStateMachine
	>(
		machine:      Machine,
		...[options]: RestParams<Machine>
	): UseMachine<Machine>{
		const  [state, send, service] = _useMachine(machine, ...[options])
		return {state, send, service}
	}

	export type UseMachine<
		Machine  extends AnyStateMachine,
		_Service extends InterpreterFrom<Machine> = InterpreterFrom<Machine>,
	> = {
		state:   CheckSnapshot<StateFrom<Machine>>,
		send:    Prop<_Service, "send">,
		service: _Service,
	}
