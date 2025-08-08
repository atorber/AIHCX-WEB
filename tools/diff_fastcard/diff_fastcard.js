const fs = require('fs');
const path = require('path');

// 文件路径
const fasttaglistPath = path.join(__dirname, 'fasttaglist.json');
const fasttplistNewPath = path.join(__dirname, 'fasttplist_new.json');
const fasttplistOnlinePath = path.join(__dirname, 'fasttplist_online.json');

// 读取并打印 fasttaglist.json
function readFasttaglist() {
    console.log('='.repeat(80));
    console.log('📋 fasttaglist.json 内容:');
    console.log('='.repeat(80));
    
    try {
        if (fs.existsSync(fasttaglistPath)) {
            const data = fs.readFileSync(fasttaglistPath, 'utf8');
            const jsonData = JSON.parse(data);
            return jsonData;
        } else {
            console.log('❌ fasttaglist.json 文件不存在');
            return null;
        }
    } catch (error) {
        console.log('❌ 读取 fasttaglist.json 时出错:', error.message);
        return null;
    }
}

// 读取并打印 fasttplist_new.json
function readFasttplistNew() {
    console.log('\n' + '='.repeat(80));
    console.log('📋 fasttplist_new.json 内容:');
    console.log('='.repeat(80));
    
    try {
        if (fs.existsSync(fasttplistNewPath)) {
            const data = fs.readFileSync(fasttplistNewPath, 'utf8');
            if (data.trim() === '') {
                console.log('📄 文件存在但为空');
                return null;
            } else {
                const jsonData = JSON.parse(data);
                return jsonData;
            }
        } else {
            console.log('❌ fasttplist_new.json 文件不存在');
            return null;
        }
    } catch (error) {
        console.log('❌ 读取 fasttplist_new.json 时出错:', error.message);
        return null;
    }
}

// 读取并打印 fasttplist_online.json 文件
function readFasttplistOnline() {
    console.log('\n' + '='.repeat(80));
    console.log('📋 fasttplist_online.json 内容:');
    console.log('='.repeat(80));
    
    try {
        if (fs.existsSync(fasttplistOnlinePath)) {
            const data = fs.readFileSync(fasttplistOnlinePath, 'utf8');
            const jsonData = JSON.parse(data);
            return jsonData;
        } else {
            console.log('❌ fasttplist_online.json 文件不存在');
            return null;
        }
    } catch (error) {
        console.log('❌ 读取 fasttplist_online.json 时出错:', error.message);
        return null;
    }
}

// 创建标签ID到标签类型名称的映射
function createTagTypeMapping(fasttaglist) {
    const tagTypeMapping = {};
    
    if (!fasttaglist || !fasttaglist.data || !fasttaglist.data.tagTypes) {
        return tagTypeMapping;
    }
    
    fasttaglist.data.tagTypes.forEach(tagType => {
        if (tagType.tagList) {
            tagType.tagList.forEach(tag => {
                tagTypeMapping[tag.tagId] = {
                    tagTypeName: tagType.tagTypeName,
                    tagType: tagType.tagType,
                    value: tag.value
                };
            });
        }
    });
    
    return tagTypeMapping;
}

// 将标签类型转换为fields格式
function convertTagTypesToFields(tagTypes) {
    const fields = {};
    
    Object.entries(tagTypes).forEach(([tagTypeName, tags]) => {
        const fieldName = getFieldNameByTagType(tagTypeName);
        if (fieldName) {
            if (fieldName === '操作方式(必填)') {
                // 操作方式字段是数组格式
                fields[fieldName] = tags.map(tag => tag.value);
            } else {
                // 其他字段是字符串格式，如果有多个值用逗号分隔
                fields[fieldName] = tags.map(tag => tag.value).join(',');
            }
        }
    });
    
    return fields;
}

// 根据标签类型名称获取对应的字段名
function getFieldNameByTagType(tagTypeName) {
    const fieldMapping = {
        '操作方式': '操作方式(必填)',
        '模型系列': '模型系列(选填)',
        '模型类别': '模型类别(选填)',
        '使用场景': '使用场景(选填)',
        '关键词': '关键词(选填)',
        '热度': '热度(选填)'
    };
    
    return fieldMapping[tagTypeName] || null;
}

// 关联卡片和标签类型，并转换为fields格式
function joinCardsWithFieldsFormat(fasttplistOnline, tagTypeMapping) {
    if (!fasttplistOnline || !fasttplistOnline.data || !fasttplistOnline.data.list) {
        return [];
    }
    
    return fasttplistOnline.data.list.map(card => {
        const cardWithTagTypes = {
            templateID: card.templateID,
            templateName: card.templateName,
            shortDesc: card.shortDesc,
            document: card.document,
            tagTypes: {}
        };
        
        if (card.tags && Array.isArray(card.tags)) {
            card.tags.forEach(tag => {
                const tagInfo = tagTypeMapping[tag.tagId];
                if (tagInfo) {
                    if (!cardWithTagTypes.tagTypes[tagInfo.tagTypeName]) {
                        cardWithTagTypes.tagTypes[tagInfo.tagTypeName] = [];
                    }
                    cardWithTagTypes.tagTypes[tagInfo.tagTypeName].push({
                        tagId: tag.tagId,
                        value: tag.value,
                        tagType: tagInfo.tagType
                    });
                }
            });
        }
        
        // 转换为fields格式
        const fields = convertTagTypesToFields(cardWithTagTypes.tagTypes);
        
        // 添加基本信息
        fields['名称(必填)'] = card.templateName;
        fields['描述(必填)'] = card.shortDesc;
        fields['官网文档链接(必填)'] = card.document || '';
        fields['上线状态'] = '已上线'; // 从fasttplist_online.json来的都是已上线的
        fields['卡片ID'] = card.templateID;
        
        return {
            templateID: card.templateID,
            templateName: card.templateName,
            shortDesc: card.shortDesc,
            document: card.document,
            tagTypes: cardWithTagTypes.tagTypes,
            fields: fields
        };
    });
}

// 打印关联结果
function printJoinedResults(joinedCards) {
    console.log('\n' + '='.repeat(80));
    console.log('🔗 卡片与标签类型关联结果:');
    console.log('='.repeat(80));
    
    console.log(`总卡片数量: ${joinedCards.length}`);
    
    // 显示前3个卡片的详细信息
    joinedCards.slice(0, 3).forEach((card, index) => {
        console.log(`\n📋 卡片 ${index + 1}: ${card.templateName} (ID: ${card.templateID})`);
        console.log(`描述: ${card.shortDesc}`);
        console.log(`文档: ${card.document || '无'}`);
        
        console.log('🏷️ 标签分类:');
        Object.entries(card.tagTypes).forEach(([tagTypeName, tags]) => {
            console.log(`  ${tagTypeName}:`);
            tags.forEach(tag => {
                console.log(`    - [${tag.tagId}] ${tag.value}`);
            });
        });
        
        console.log('📝 Fields格式:');
        console.log(JSON.stringify(card.fields, null, 2));
    });
    
    if (joinedCards.length > 3) {
        console.log(`\n... (还有 ${joinedCards.length - 3} 个卡片)`);
    }
    
    // 统计各标签类型的使用情况
    const tagTypeStats = {};
    joinedCards.forEach(card => {
        Object.entries(card.tagTypes).forEach(([tagTypeName, tags]) => {
            if (!tagTypeStats[tagTypeName]) {
                tagTypeStats[tagTypeName] = {
                    count: 0,
                    tags: {}
                };
            }
            tagTypeStats[tagTypeName].count++;
            tags.forEach(tag => {
                if (!tagTypeStats[tagTypeName].tags[tag.value]) {
                    tagTypeStats[tagTypeName].tags[tag.value] = 0;
                }
                tagTypeStats[tagTypeName].tags[tag.value]++;
            });
        });
    });
    
    console.log('\n📊 标签类型统计:');
    Object.entries(tagTypeStats).forEach(([tagTypeName, stats]) => {
        console.log(`\n${tagTypeName} (${stats.count} 个卡片使用):`);
        Object.entries(stats.tags)
            .sort(([,a], [,b]) => b - a)
            .forEach(([tagValue, count]) => {
                console.log(`  ${tagValue}: ${count} 次`);
            });
    });
}

// 导出关联结果为JSON文件（fields格式）
function exportJoinedResults(joinedCards) {
    // 导出完整格式
    const outputPath = path.join(__dirname, 'joined_cards_with_tagtypes.json');
    try {
        fs.writeFileSync(outputPath, JSON.stringify(joinedCards, null, 2), 'utf8');
        console.log(`\n💾 完整关联结果已导出到: ${outputPath}`);
    } catch (error) {
        console.log('❌ 导出完整文件时出错:', error.message);
    }
    
    // 导出fields格式（模拟fasttplist_new.json的结构）
    const fieldsFormat = {
        code: 200,
        success: true,
        data: {
            total: joinedCards.length,
            records: joinedCards.map(card => ({
                recordId: `rec_${card.templateID}`,
                createdAt: Date.now(),
                updatedAt: Date.now(),
                fields: card.fields
            }))
        }
    };
    
    const fieldsOutputPath = path.join(__dirname, 'joined_cards_fields_format.json');
    try {
        fs.writeFileSync(fieldsOutputPath, JSON.stringify(fieldsFormat, null, 2), 'utf8');
        console.log(`💾 Fields格式结果已导出到: ${fieldsOutputPath}`);
    } catch (error) {
        console.log('❌ 导出fields格式文件时出错:', error.message);
    }
}

// 主函数
function main() {
    console.log('🚀 开始读取文件...\n');
    
    const fasttaglist = readFasttaglist();
    const fasttplistNew = readFasttplistNew();
    const fasttplistOnline = readFasttplistOnline();
    
    if (fasttaglist && fasttplistOnline) {
        console.log('\n' + '='.repeat(80));
        console.log('🔄 开始关联处理...');
        console.log('='.repeat(80));
        
        // 创建标签类型映射
        const tagTypeMapping = createTagTypeMapping(fasttaglist);
        console.log(`📝 创建了 ${Object.keys(tagTypeMapping).length} 个标签映射`);
        
        // 关联卡片和标签类型，并转换为fields格式
        const joinedCards = joinCardsWithFieldsFormat(fasttplistOnline, tagTypeMapping);
        console.log(`🔗 成功关联 ${joinedCards.length} 个卡片`);
        
        // 打印结果
        printJoinedResults(joinedCards);
        
        // 导出结果
        exportJoinedResults(joinedCards);
    } else {
        console.log('❌ 无法进行关联处理，请检查文件是否存在');
    }
    
    console.log('\n' + '='.repeat(80));
    console.log('✅ 处理完成');
    console.log('='.repeat(80));
}

// 运行脚本
main();
