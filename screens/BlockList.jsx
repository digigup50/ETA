import { Button } from 'native-base';
import { useEffect, useState } from 'react';
import { FlatList, SafeAreaView, View, Text } from 'react-native';
import UserAPI from '../api/UserAPI';
import MainUser from '../components/MainUser';

const BlockList = () => {

    const [blockList, setBlockList] = useState(null)

    useEffect(() => {
        console.error("BLOCK LIUST HAS LOADED LMAOO");
        const blockList = MainUser.getBlockList()
        if (blockList.length > 0) { 
            setBlockList(blockList);
        }
    })

    const userApi = new UserAPI();

    async function unBlockUser(user){ 
       const filteredList = blockList.filter((item) => item.id !== user.id)
       const userIds = filteredList.map((item) => item.id)
       const result = await userApi.partialUpdate(MainUser.getUserId(), {block_list: userIds});
       if (result && result.code !== -1) { 
            console.log(result)
            setBlockList(result.block_list);
            MainUser.loadUserFromData(result);
       } else{
           Alert.alert("Sorry, we couldn't unblock that user. Try again");
       }
    }

    console.error(blockList)
    return <SafeAreaView>
        <FlatList style={{height: '100%'}}
            data={blockList}
            renderItem={(item) => <View style={{width: '100%', padding: 8, backgroundColor: 'white', display: 'flex', flexDirection: 'row', flex: 1, justifyContent: 'space-between', alignItems: 'center'}}>
                <Text>{item.item.username}</Text>
                <Button onPress={() => unBlockUser(item.item) }>
                    <Text style={{color: 'white', padding: 5}}>Unblock</Text>
                </Button>
                </View>}
        />
    </SafeAreaView> 
}

export default BlockList;