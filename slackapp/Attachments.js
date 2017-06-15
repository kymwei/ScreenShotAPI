exports.cards = {
     platformAttachments : function (url, user, userid) {
        return attachments = [
            {
                "text": "Select the platforms to get screenshots",
                "fallback": "Please choose a platform",
                "color": "#36a64f",
                "title": "Hi " + user + ", MooMoo will generate screenshots for " + url,
                "callback_id": "platforms",
                "actions": [
                    {
                        "name": "platform",
                        "text": "All",
                        "type": "button",
                        "value": JSON.stringify({platform:"all",url:url, user: user, userid: userid}),
                        "style": "primary"
                    },
                    {
                        "name": "platform",
                        "text": "Desktop",
                        "type": "button",
                        "value": JSON.stringify({platform:"desktop",url:url, user: user, userid: userid})
                    },
                    {
                        "name": "platform",
                        "text": "Tablet",
                        "type": "button",
                        "value": JSON.stringify({platform:"tablet",url:url, user: user, userid: userid})
                    },
                    {
                        "name": "platform",
                        "text": "Smartphone",
                        "type": "button",
                        "value": JSON.stringify({platform:"smartphone",url:url, user: user, userid: userid})
                    },
                    {
                        "name": "platform",
                        "text": "Cancel",
                        "type": "button",
                        "value": false,
                        "style": "danger"
                    }
                ]
            }
        ];
    },

    dislpaySreenShot : function (data) {
        return attachments = [
            {
                "text": "Do you want to display all Screenshots in the Channel",
                "fallback": "display screenshots?",
                "callback_id": "displayScreenShot",
                "color": "#3AA3E3",
                "actions": [
                    {
                        "name": "display",
                        "text": "Yes! Please",
                        "type": "button",
                        "value": JSON.stringify({display:true}),
                        "style": "primary"
                    },
                    {
                        "name": "cancel",
                        "text": "NO, Thanks",
                        "type": "button",
                        "value": false,
                        "style": "danger"
                    }
                ]
            }
        ];
    }


}