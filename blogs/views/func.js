function fsearch()
{
	var ul,li,a,filter;
	filter = document.getElementById("search").value.toUpperCase();
	ul = document.getElementsByTagName("ul")[0];
	li = ul.getElementsByTagName("li");
	for(var i=0;i<li.length;i++)
	{
	console.log(li[i].getElementsByTagName("a")[0].innerHTML.toUpperCase());
	if(li[i].getElementsByTagName("a")[0].innerHTML.toUpperCase().indexOf(filter) > -1) li[i].style.color = "red";
	else li[i].style.color = "blue";
	}
}