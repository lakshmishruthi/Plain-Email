      var CLIENT_ID = '956956950540-qkifems6t6ie5sp47vs9hfmi94par1bc.apps.googleusercontent.com';
      var apiKey = 'AIzaSyBOHcY998qIe5lY_w3iwAcothkBCLUO1To';
      var SCOPES = ['https://www.googleapis.com/auth/gmail.readonly'];


      window.onload = checkAuth();

      /**
       * Check if current user has authorized this application.
       */
      function checkAuth() {alert("hello");
        gapi.auth.authorize(
          {
            'client_id': CLIENT_ID,
            'scope': SCOPES.join(' '),
            'immediate': true
          }, handleAuthResult);
      }

      /**
       * Handle response from authorization server.
       *
       * @param {Object} authResult Authorization result.
       */
      function handleAuthResult(authResult) {alert("handleAuthResult");
        var authorizeDiv = document.getElementById('authorize-div');
        if (authResult && !authResult.error) {
          // Hide auth UI, then load client library.
          authorizeDiv.style.display = 'none';
          loadGmailApi();
        } else {
          // Show auth UI, allowing the user to initiate authorization by
          // clicking authorize button.
          authorizeDiv.style.display = 'inline';
        }
      }

      /**
       * Initiate auth flow in response to user clicking authorize button.
       *
       * @param {Event} event Button click event.
       */
      function handleAuthClick(event) {
        gapi.auth.authorize(
          {client_id: CLIENT_ID, scope: SCOPES, immediate: false},
          handleAuthResult);
        return false;
      }

      /**
       * Load Gmail API client library. List labels once client library
       * is loaded.
       */
      function loadGmailApi() {
        gapi.client.load('gmail', 'v1', listLabels);
      }

      /**
       * Print all Labels in the authorized user's inbox. If no labels
       * are found an appropriate message is printed.
       */
       
      function listLabels() {
        var request = gapi.client.gmail.users.labels.list({
          'userId': 'me'
        });
        var arr = [];
        request.execute(function(resp) {
          var labels = resp.labels;
          // appendPre('Labels:');

          if (labels && labels.length > 0) {
            for (i = 0; i < labels.length; i++) {
              var label = labels[i];
              //appendPre(label.name)
              arr[i] = label.name;
              addLabel(arr[i]);
            }
          } else {
            appendPre('No Labels found.');
          }
        });
      }

      function addLabel(value) {
        var x = document.getElementById("Labels_list");
        var option = document.createElement("option");
        option.text = value;
        x.add(option);
      }

      function onSelect() {
        var selectBox = document.getElementById("Labels_list");
        var selectedValue = selectBox.options[selectBox.selectedIndex].value;
        displayMessages(selectedValue);
      }
      
      function displayMessages(selectedValue){
        document.getElementById("Labels_list").style.display = "none";
        $('.table-message').removeClass("hidden");
        var request = gapi.client.gmail.users.messages.list({
          'userId': 'me',
          'labelIds': selectedValue,
          'maxResults': 10
        });
        request.execute(function(response){
          $.each(response.messages, function() {
            var msgReq = gapi.client.gmail.users.messages.get({
             'userId': 'me',
             'id': this.id
            });
            msgReq.execute(addMsg);
          });
        });

      }
      function addMsg(message)
      {
        $('.table-message tbody').append(
          '<tr>\
            <td>' + getHeader(message.payload.headers, 'From') +
            '</td>\
              <td>\
                <a href="#message-modal-' + message.id +
                  '" data-toggle="modal" id="message-link-' + message.id+ '">' +
                  getHeader(message.payload.headers, 'Subject') +
                '</a>\
              </td>\
            <td>' + getHeader(message.payload.headers, 'Date') + 
            '</td>\
          </tr>'
        );
        $('body').append(
            '<div class="modal fade" id="message-modal-' + message.id + 'tabindex="-1" role="dialog" aria-labelledby="myModalLabel">\
              <div class="modal-dialog modal-lg">\
                <div class="modal-content">\
                  <div class="modal-header">\
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">\
                      <span aria-hidden="true">&times;</span>\
                    </button>\
                    <h4 class="modal-title" id="myModalLabel">' + getHeader(message.payload.headers, 'Subject') + 
                    '</h4>\
                    <div class="modal-body">\
                      <iframe id="message-iframe-'+message.id+'" srcdoc="<p>Loading...</p>">\
                      </iframe>\
                    </div>\
                    <div class="modal-footer">\
                      <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>\
                      <button type="button" class="btn btn-default" data-dismiss="modal">Reply</button>\
                      <button type="button" class="btn btn-default" data-dismiss="modal">Forward</button>\
                    </div>\
                  </div>\
                </div>\
              </div>\
            </div>'
          );
        $('#message-link-'+message.id).on('click', function(){
          var ifrm = $('#message-iframe-'+message.id)[0].contentWindow.document;
          $('body', ifrm).html(getMessageBody(message.payload));
          //$('message-iframe-'+message.id).append(message.id);
          //alert(message.id);
        });
      }
      
      function getHeader(headers, index) {
        var header = '';
        $.each(headers, function(){
          if(this.name.toLowerCase() === index.toLowerCase()){
            header = this.value;
          }
        });
        return header;
      }

      function getMessageBody(message) {//alert(message);
        var encodedBody = '';
        if(typeof message.parts === 'undefined')
        {
          encodedBody = message.body.data;
        }
        else
        {
          encodedBody = getHTMLPart(message.parts);
        }
        encodedBody = encodedBody.replace(/-/g, '+').replace(/_/g, '/').replace(/\s/g, '');
        //alert(decodeURIComponent(escape(window.atob(encodedBody))));
        return decodeURIComponent(escape(window.atob(encodedBody)));
      }

      function getHTMLPart(arr) {
        for(var x = 0; x <= arr.length; x++)
        {
          if(typeof arr[x].parts === 'undefined')
          {
            if(arr[x].mimeType === 'text/html')
            {
              return arr[x].body.data;
            }
          }
          else
          {
            return getHTMLPart(arr[x].parts);
          }
        }
        return '';
      }
      /**
       * Append a pre element to the body containing the given message
       * as its text node.
       *
       * @param {string} message Text to be placed in pre element.
       */
      function appendPre(message) {
        var pre = document.getElementById('output');
        var textContent = document.createTextNode(message + '\n');
        pre.appendChild(textContent);
      }
