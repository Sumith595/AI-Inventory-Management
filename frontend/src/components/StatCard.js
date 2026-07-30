import { Card, CardContent, Typography } from "@mui/material";

function StatCard({title,value,color}){

return(

<Card
	sx={{
		width: 220,
		height: 140,
		background: color,
		color: "white",
		borderRadius: 3,
		boxShadow: '0 12px 30px rgba(2,6,23,0.25)'
	}}
>
	<CardContent sx={{display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center', height: '100%'}}>
		<Typography variant="subtitle1" sx={{opacity: 0.95}}>
			{title}
		</Typography>
		<Typography variant="h3" sx={{marginTop: 1, fontWeight: 800}}>
			{value}
		</Typography>
	</CardContent>

</Card>

);

}

export default StatCard;