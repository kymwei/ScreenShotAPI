exports.cards = {
     platformAttachments : function (url) {
        return attachments = [
            {
                "text": "Select the platforms to get screenshots",
                "fallback": "You are unable to choose a platform",
                "callback_id": "platforms",
                "actions": [
                    {
                        "name": "platform",
                        "text": "All",
                        "type": "button",
                        "value": JSON.stringify({platform:"all",url:url}),
                        "style": "primary"
                    },
                    {
                        "name": "platform",
                        "text": "Desktop",
                        "type": "button",
                        "value": JSON.stringify({platform:"desktop",url:url})
                    },
                    {
                        "name": "platform",
                        "text": "Tablet",
                        "type": "button",
                        "value": JSON.stringify({platform:"tablet",url:url})
                    },
                    {
                        "name": "platform",
                        "text": "Smartphone",
                        "type": "button",
                        "value": JSON.stringify({platform:"smartphone",url:url})
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

    dislpaySreenShot : function (url) {
        return attachments = [
            {
                "text": "Do you want to See the screenshot on Slack",
                "fallback": "You are unable to display",
                "callback_id": "displayScreenShot",
                "actions": [
                    {
                        "name": "display",
                        "text": "Yes! Please",
                        "type": "button",
                        "value": JSON.stringify({display:true,url:url}),
                        "style": "primary"
                    },
                    {
                        "name": "cancel",
                        "text": "NO, Thanks",
                        "type": "button",
                        "value": JSON.stringify({display:false,url:url}),
                        "style": "danger"
                    }
                ]
            }
        ];
    }


}