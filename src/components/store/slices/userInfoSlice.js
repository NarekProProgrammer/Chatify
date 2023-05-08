import { createSlice } from "@reduxjs/toolkit";

const userInfoSlice = createSlice({
	name: 'userInfo',
	initialState: {
		firstName: 'Max',
		lastName: 'Karpov',
		dateOfBirth: '16 February',
		floor: 'male',
		email: 'maxkarpov@gmail.com',
		password: '123asd',
		phone: 123456,
		adress: 'St. Pushkin'
	},

	reducers: {
		updateSetting(state, action) {
			const { field, value } = action.payload;
			state[field] = value;
		}
	}
});

export const { updateSetting } = userInfoSlice.actions;
export default userInfoSlice.reducer;