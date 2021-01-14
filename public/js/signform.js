function check_email()
{
	var email = $('#email').val();
	email = $.trim(email);

	if (email == '')
	{
		$("#reg-info").html('<span style="color:red;font-weight:bold;">Please provide your email id</span>')
		return false;
	} 
	else if (/\s/g.test(email)) 
	{

		$('#reg-info').html('<span style="color:red;font-weight:bold;">Don\'t provide spaces.Provide valid email id</span>');
		return false;
	}
	else 
	{
		return true;
	}
}

function check_username()
{
	var username = $('#username').val();
	username = $.trim(username);
	
	if(username == '') 
	{
		$('#reg-info').fadeIn();
		$('#reg-info').html('<span style="color:red;font-weight:bold;">Please provide username</span>');
		return false;
	} 
	else if (/\s/g.test(username))
	{
		$('#reg-info').html('<span style="color:red;font-weight:bold;">Don\'t provide spaces in your username.</span>');
		return false;
	}
	else if(/\W/g.test(username))
	{
		$('#reg-info').html('<span style="color:red;font-weight:bold;">You can\'t use special characters in username.</span>');
		return false;
	}
	else
	{
		return true;
	}
}


function check_name()
{
	var name = $('#fullname').val();
	name = $.trim(name);

	if(name == '')
	{
		$('#reg-info').html('<span style="color:red;font-weight:bold;">Please provide your Last Name</span>');
		return false;
	}
	else
	{
		return true;
	}
}

function check_password()
{
	var pass = $('#password').val();
	pass = $.trim(pass);

	if(pass == '')
	{
		$('#reg-info').html('<span style="color:red;font-weight:bold;">Please provide password,Don\'t use spaces</span>');
		return false;
	}
	else if(/\W/g.test(pass))
	{
		$('#reg-info').html('<span style="color:red;font-weight:bold;">Password should be alphanumeric only.</span>');
		return false;
	}
	else
	{
		return true;
	}
}
	
$('#reg-form').on('submit',function(e){
	e.preventDefault();
	var url = "/register";
	if(check_email())
	{
		if(check_username())
		{
			if(check_name())
			{
				// if(check_password())
				// {
					var email = $('#email').val();
					email = $.trim(email);
					var name = $('#fullname').val();
					name = $.trim(name);
					var pass = $('#password').val();
					pass = $.trim(pass);
					var username = $('#username').val();
					username = $.trim(username);
					var gender = $("input[name=gender]:checked").val();
					var data = {
						email:email,
						name:name,
						gender:gender,
						username:username,
						pass:pass
					};
					$.ajax({
						type:"POST",
						url:url,
						data:data,
						beforeSend:function()
						{
							$("#reg-info").html('<span style="color:blue;font-weight:bold;">Registering...</span>');
						},
						success: function(data){
							$("#reg-info").html(data);
							setTimeout(function(){
						 		$("#reg-info").html(""); 
							}, 8000);
						},
						error: function(){
							$("#reg-info").html('<span style="color:black;font-weight:bold;">Connection is Lost! Check your internet connection</span>');
						},
						complete: function()
						{
						}
					});
				//}
			}
		}
	}
});

$('#login-form').on('submit',function(e){	
	e.preventDefault();
	var url = "/signin";
	var logemail = $("#logemail").val();
	var logpass = $("#logpass").val();
	if(logemail != '' && logpass != '' && /\W/g.test(logpass)==false)
	{
		var data = {
			logemail:logemail,
			logpass:logpass
		}
		$.ajax({
			type:"POST",
			url:url,
			data:data,
			beforeSend:function()
			{
				$("#log-info").html('<span style="color:blue;font-weight:bold;">Logging...</span>');
			},
			success: function(data){
				if(data=="true")
				{
					window.location.href="/home/feed";
				}
				else
				{
					$("#log-info").html(data);
				}				
			},
			error: function(data){
				$("#log-info").html('<span style="color:black"><b>Check your internet connection</b></span>');
			},
			complete: function()
			{
			}
		});
	}
	else
	{
		$("#log-info").html('<span style="color:red"><b>Invalid Credientials Format</b></span>');

	}
			
});


